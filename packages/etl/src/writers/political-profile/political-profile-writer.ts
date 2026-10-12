import { slugify } from "@smart-politics/core";
import type { Prisma, PrismaClient } from "@smart-politics/db";

import type { JobContext } from "../../contracts/job.contract";
import type { CandidateParty, PoliticalProfileCandidate } from "../../domain/political-profile-candidate";
import type { ImportDecision } from "../../import-engine/contracts/import-decision.contract";
import type { WriteOutcome } from "../write-outcome.model";
import { buildSafeProfileUpdate } from "./political-profile-update-fields";
import type { PoliticalProfileWriter } from "./political-profile-writer.contract";

type Tx = Prisma.TransactionClient;

const PRESIDENTIAL_OFFICE_TYPE = "president" as const;
const MAX_SLUG_ATTEMPTS = 20;

/**
 * Primeira persistência real do ETL (docs/SPECs/etl.md#5-persist). Nunca
 * escreve fora do que `ImportDecision.action` autoriza — "Nunca atualizar
 * diretamente. Toda escrita deve passar pela ImportDecision":
 *
 *   CREATE          → cria PoliticalProfile + PoliticalAffiliation atual
 *   UPDATE          → atualiza só os campos de buildSafeProfileUpdate()
 *   MERGE           → arquitetura preparada, não executa (vira manualReview)
 *   MANUAL_REVIEW   → não escreve, só loga
 *   IGNORE          → não escreve
 *
 * Cada candidato é sua própria transação Prisma — uma falha nunca deixa um
 * PoliticalProfile sem PoliticalAffiliation nem referencia um partido/cargo
 * inexistente (integridade referencial).
 */
export class PrismaPoliticalProfileWriter implements PoliticalProfileWriter {
  constructor(private readonly prisma: PrismaClient) {}

  async write(candidate: PoliticalProfileCandidate, decision: ImportDecision, context: JobContext): Promise<WriteOutcome> {
    const base = { candidateId: candidate.id, action: decision.action };

    try {
      switch (decision.action) {
        case "CREATE":
          return await this.executeCreate(candidate, context, base);
        case "UPDATE":
          return await this.executeUpdate(candidate, decision, context, base);
        case "MERGE":
          context.logger.warn("MERGE ainda não implementado — arquitetura preparada, decisão registrada como revisão manual.", {
            candidateId: candidate.id,
            targetEntityId: decision.targetEntityId,
          });
          return { ...base, kind: "manualReview" };
        case "MANUAL_REVIEW":
          context.logger.warn("Candidato requer revisão manual — nada foi escrito.", {
            candidateId: candidate.id,
            reason: decision.reason,
            warnings: decision.warnings,
          });
          return { ...base, kind: "manualReview" };
        case "IGNORE":
          context.logger.info("Candidato ignorado pela ImportDecision — nada foi escrito.", {
            candidateId: candidate.id,
            reason: decision.reason,
          });
          return { ...base, kind: "ignored" };
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      context.logger.error(`Falha ao escrever candidato ${candidate.id}: ${message}`, { candidateId: candidate.id });
      return { ...base, kind: "failed", error: message };
    }
  }

  private async executeCreate(
    candidate: PoliticalProfileCandidate,
    context: JobContext,
    base: { candidateId: string; action: ImportDecision["action"] },
  ): Promise<WriteOutcome> {
    const profileId = await this.prisma.$transaction(async (tx) => {
      const officeId = await this.findOfficeIdOrThrow(tx, PRESIDENTIAL_OFFICE_TYPE);
      const partyId = await this.ensureParty(tx, candidate.party);
      const slug = await this.generateUniqueSlug(tx, candidate.ballotName || candidate.fullName);

      const profile = await tx.politicalProfile.create({
        data: {
          slug,
          fullName: candidate.fullName,
          displayName: candidate.ballotName,
          status: "candidate",
          isCandidate: true,
          isIncumbent: false,
          currentOffice: { connect: { id: officeId } },
        },
      });

      await this.ensureCurrentAffiliation(tx, profile.id, partyId, candidate);
      await this.persistKnownMandateIfAny(tx, profile.id, officeId, candidate, context);

      return profile.id;
    });

    context.logger.info(`Perfil criado para "${candidate.ballotName}".`, { candidateId: candidate.id, profileId });
    return { ...base, kind: "imported", entityId: profileId };
  }

  private async executeUpdate(
    candidate: PoliticalProfileCandidate,
    decision: ImportDecision,
    context: JobContext,
    base: { candidateId: string; action: ImportDecision["action"] },
  ): Promise<WriteOutcome> {
    const targetEntityId = decision.targetEntityId;
    if (!targetEntityId) {
      const error = "ImportDecision de UPDATE sem targetEntityId — não é seguro atualizar sem saber qual registro.";
      context.logger.error(error, { candidateId: candidate.id });
      return { ...base, kind: "failed", error };
    }

    const profileId = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.politicalProfile.findUnique({ where: { id: targetEntityId }, select: { id: true } });
      if (!existing) {
        throw new Error(`Perfil "${targetEntityId}" não encontrado — UPDATE abortado.`);
      }

      const officeId = await this.findOfficeIdOrThrow(tx, PRESIDENTIAL_OFFICE_TYPE);
      const partyId = await this.ensureParty(tx, candidate.party);

      await tx.politicalProfile.update({ where: { id: existing.id }, data: buildSafeProfileUpdate(candidate) });
      await this.ensureCurrentAffiliation(tx, existing.id, partyId, candidate);
      await this.persistKnownMandateIfAny(tx, existing.id, officeId, candidate, context);

      return existing.id;
    });

    context.logger.info(`Perfil "${profileId}" atualizado (campos permitidos apenas).`, { candidateId: candidate.id, profileId });
    return { ...base, kind: "updated", entityId: profileId };
  }

  private async findOfficeIdOrThrow(tx: Tx, type: typeof PRESIDENTIAL_OFFICE_TYPE): Promise<string> {
    const office = await tx.politicalOffice.findUnique({ where: { type }, select: { id: true } });
    if (!office) {
      throw new Error(`PoliticalOffice "${type}" não encontrado — rode o seed de PoliticalProfile antes do ETL.`);
    }
    return office.id;
  }

  /** Nunca sobrescreve um partido já existente — só cria quando realmente não existe. */
  private async ensureParty(tx: Tx, party: CandidateParty): Promise<string> {
    const existing = await tx.politicalParty.findUnique({ where: { acronym: party.acronym }, select: { id: true } });
    if (existing) return existing.id;

    const numberValue = Number.parseInt(party.number, 10);
    const created = await tx.politicalParty.create({
      data: {
        acronym: party.acronym,
        name: party.name,
        number: Number.isNaN(numberValue) ? null : numberValue,
      },
    });
    return created.id;
  }

  private async generateUniqueSlug(tx: Tx, source: string): Promise<string> {
    const base = slugify(source);
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const candidateSlug = attempt === 0 ? base : `${base}-${attempt + 1}`;
      const existing = await tx.politicalProfile.findUnique({ where: { slug: candidateSlug }, select: { id: true } });
      if (!existing) return candidateSlug;
    }
    throw new Error(`Não foi possível gerar slug único para "${source}" após ${MAX_SLUG_ATTEMPTS} tentativas.`);
  }

  /**
   * Filiação partidária é histórica: nunca apaga a anterior, só a fecha
   * (isCurrent=false, endDate) e abre uma nova quando o partido observado
   * mudou. Data de início é a de coleta — o TSE não informa quando a
   * filiação de fato começou.
   */
  private async ensureCurrentAffiliation(tx: Tx, profileId: string, partyId: string, candidate: PoliticalProfileCandidate): Promise<void> {
    const current = await tx.politicalAffiliation.findFirst({ where: { profileId, isCurrent: true } });

    if (!current) {
      await tx.politicalAffiliation.create({
        data: {
          profileId,
          partyId,
          startDate: candidate.collectedAt,
          isCurrent: true,
          reason: `Filiação observada via TSE DivulgaCandContas (eleição ${candidate.election.year}) — data de início real não verificada.`,
        },
      });
      return;
    }

    if (current.partyId === partyId) return;

    await tx.politicalAffiliation.update({
      where: { id: current.id },
      data: { isCurrent: false, endDate: candidate.collectedAt },
    });
    await tx.politicalAffiliation.create({
      data: {
        profileId,
        partyId,
        startDate: candidate.collectedAt,
        isCurrent: true,
        reason: `Troca de partido detectada via TSE DivulgaCandContas (eleição ${candidate.election.year}).`,
      },
    });
  }

  /**
   * Só cria Mandate quando a fonte confirma resultado eleitoral
   * (`candidate.knownMandate`) — nunca a partir de mera candidatura (ver
   * domain/political-profile-candidate.ts#CandidateKnownMandate). Hoje o
   * TseNormalizer sempre envia `knownMandate: null`, então este método é um
   * no-op — mas já idempotente (não duplica) para quando deixar de ser.
   */
  private async persistKnownMandateIfAny(
    tx: Tx,
    profileId: string,
    officeId: string,
    candidate: PoliticalProfileCandidate,
    context: JobContext,
  ): Promise<void> {
    if (!candidate.knownMandate) {
      context.logger.info("Nenhum mandato conhecido pelo TSE para esta candidatura (endpoint de candidatos não informa resultado eleitoral).", {
        candidateId: candidate.id,
      });
      return;
    }

    const { startDate, endDate, electoralResult } = candidate.knownMandate;
    const existing = await tx.mandate.findFirst({ where: { profileId, officeId, electionYear: candidate.election.year } });
    if (existing) return;

    await tx.mandate.create({
      data: { profileId, officeId, startDate, endDate, electionYear: candidate.election.year, electoralResult, startReason: "election" },
    });
  }
}
