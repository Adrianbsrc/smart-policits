import type { PoliticalOfficeType } from "@smart-politics/db";

import type {
  AffiliationWithParty,
  MandateWithOffice,
  PoliticalProfileResult,
} from "../../political-profiles/political-profiles.repository";
import type { Evidence, EvidenceImpact, EvidenceSource } from "../domain";

/**
 * Primeiro Evidence Builder (docs/SPECs/core/evidence.md, docs/SPECs/core/political-profile.md).
 * Gera Evidence a partir de um PoliticalProfile já persistido — eleição,
 * filiação partidária e mandato. Patrimônio declarado fica de fora: não há
 * `AssetDeclaration` ligado a `PoliticalProfile` ainda (só ao domínio legado
 * `Politician`), então "quando existir" (redação da task) hoje é nunca.
 *
 * Função pura: recebe dados já buscados (mesmos métodos que
 * PoliticalTimelineService usava), nunca acessa o Prisma diretamente —
 * a persistência é responsabilidade do repository, não do builder.
 */

export type EvidenceDraft = Omit<Evidence, "id" | "createdAt" | "updatedAt">;

const TSE_SOURCE_NAME = "TSE — Tribunal Superior Eleitoral";

const CRITICAL_OFFICES: readonly PoliticalOfficeType[] = ["president"];
const HIGH_OFFICES: readonly PoliticalOfficeType[] = ["governor", "senator"];

/** Mesmos limiares de TimelineImportanceResolver (removido — Evidence.impact substitui "importância" na origem). */
function resolveOfficeImpact(officeType: PoliticalOfficeType): EvidenceImpact {
  if (CRITICAL_OFFICES.includes(officeType)) return "critical";
  if (HIGH_OFFICES.includes(officeType)) return "high";
  return "medium";
}

function buildOfficialSource(collectedAt: Date): EvidenceSource {
  return {
    name: TSE_SOURCE_NAME,
    url: null,
    organization: "Tribunal Superior Eleitoral",
    type: "official_document",
    reliability: "official",
    collectedAt,
    checksum: null,
  };
}

/** TSE não expõe o dia exato da eleição por mandato aqui — eleições gerais brasileiras ocorrem em outubro; usado só para ordenação cronológica, nunca afirmado como data exata no texto da Evidence. */
function approximateElectionDate(electionYear: number): Date {
  return new Date(electionYear, 9, 1);
}

function electionResultLabel(result: MandateWithOffice["electoralResult"]): string {
  switch (result) {
    case "elected":
      return "Eleito(a)";
    case "runner_up":
      return "Foi ao segundo turno";
    case "not_elected":
      return "Não eleito(a)";
    default:
      return "Candidato(a)";
  }
}

function buildElectionEvidence(
  profileId: string,
  mandate: MandateWithOffice,
  source: EvidenceSource,
): EvidenceDraft[] {
  if (!mandate.electionYear) return [];

  const impact = resolveOfficeImpact(mandate.office.type);
  const resultLabel = electionResultLabel(mandate.electoralResult);
  const roundLabel = mandate.electionRound ? ` (${mandate.electionRound}º turno)` : "";
  const votesLabel = mandate.votes ? ` — ${mandate.votes.toLocaleString("pt-BR")} votos` : "";

  return [
    {
      politicalProfileId: profileId,
      mandateId: mandate.id,
      title: `Eleição para ${mandate.office.name} em ${mandate.electionYear}`,
      summary: `${resultLabel} para ${mandate.office.name} na eleição de ${mandate.electionYear}${roundLabel}.`,
      description: `${resultLabel} para o cargo de ${mandate.office.name} no pleito de ${mandate.electionYear}${roundLabel}${votesLabel}. Fonte: registro de candidatura e resultado eleitoral do TSE.`,
      occurredAt: approximateElectionDate(mandate.electionYear),
      publishedAt: null,
      categories: ["political_career"],
      impact,
      reliability: "official",
      sources: [source],
      contexts: [],
      attachments: [],
      tags: ["eleição", String(mandate.electionYear)],
      metadata: {
        generatedBy: "political-profile-evidence-builder",
        electionYear: String(mandate.electionYear),
        electoralResult: mandate.electoralResult ?? "unknown",
      },
    },
  ];
}

function buildMandateEvidence(
  profileId: string,
  mandate: MandateWithOffice,
  source: EvidenceSource,
): EvidenceDraft[] {
  const impact = resolveOfficeImpact(mandate.office.type);
  const events: EvidenceDraft[] = [];

  const startDetails = [`Assumiu o cargo de ${mandate.office.name}`];
  if (mandate.reelected) startDetails.push("(reeleição)");
  if (mandate.electionYear) startDetails.push(`após a eleição de ${mandate.electionYear}`);
  const startSummary = `${startDetails.join(" ")}.`;

  events.push({
    politicalProfileId: profileId,
    mandateId: mandate.id,
    title: `Início de mandato: ${mandate.office.name}`,
    summary: startSummary,
    description: mandate.description?.trim() ? mandate.description : startSummary,
    occurredAt: mandate.startDate,
    publishedAt: null,
    categories: ["political_career"],
    impact,
    reliability: "official",
    sources: [source],
    contexts: [],
    attachments: [],
    tags: ["mandato", mandate.office.type],
    metadata: { generatedBy: "political-profile-evidence-builder", officeType: mandate.office.type },
  });

  if (mandate.endDate) {
    const endSummary = `Encerrou o mandato de ${mandate.office.name}${mandate.endReason ? ` — motivo: ${mandate.endReason}` : "."}`;

    events.push({
      politicalProfileId: profileId,
      mandateId: mandate.id,
      title: `Fim de mandato: ${mandate.office.name}`,
      summary: endSummary,
      description: endSummary,
      occurredAt: mandate.endDate,
      publishedAt: null,
      categories: ["political_career"],
      impact,
      reliability: "official",
      sources: [source],
      contexts: [],
      attachments: [],
      tags: ["mandato", "fim-de-mandato", mandate.office.type],
      metadata: { generatedBy: "political-profile-evidence-builder", officeType: mandate.office.type },
    });
  }

  return events;
}

function buildAffiliationEvidence(
  profileId: string,
  affiliation: AffiliationWithParty,
  source: EvidenceSource,
): EvidenceDraft[] {
  const events: EvidenceDraft[] = [];
  const acronym = affiliation.party.acronym;
  const fullName = affiliation.party.name;

  const startSummary = `Passou a integrar o ${fullName} (${acronym})${affiliation.reason ? ` — ${affiliation.reason}` : "."}`;

  events.push({
    politicalProfileId: profileId,
    mandateId: null,
    title: `Filiação ao ${acronym}`,
    summary: startSummary,
    description: startSummary,
    occurredAt: affiliation.startDate,
    publishedAt: null,
    categories: ["political_career"],
    impact: "medium",
    reliability: "official",
    sources: [source],
    contexts: [],
    attachments: [],
    tags: ["filiação partidária", acronym],
    metadata: { generatedBy: "political-profile-evidence-builder", partyAcronym: acronym },
  });

  if (affiliation.endDate) {
    const endSummary = `Deixou o ${fullName} (${acronym})${affiliation.reason ? ` — ${affiliation.reason}` : "."}`;

    events.push({
      politicalProfileId: profileId,
      mandateId: null,
      title: `Desfiliação do ${acronym}`,
      summary: endSummary,
      description: endSummary,
      occurredAt: affiliation.endDate,
      publishedAt: null,
      categories: ["political_career"],
      impact: "medium",
      reliability: "official",
      sources: [source],
      contexts: [],
      attachments: [],
      tags: ["filiação partidária", "desfiliação", acronym],
      metadata: { generatedBy: "political-profile-evidence-builder", partyAcronym: acronym },
    });
  }

  return events;
}

export function buildEvidencesFromPoliticalProfile(
  profile: PoliticalProfileResult,
  mandates: MandateWithOffice[],
  affiliations: AffiliationWithParty[],
): EvidenceDraft[] {
  const source = buildOfficialSource(new Date());

  return [
    ...mandates.flatMap((mandate) => buildElectionEvidence(profile.id, mandate, source)),
    ...mandates.flatMap((mandate) => buildMandateEvidence(profile.id, mandate, source)),
    ...affiliations.flatMap((affiliation) => buildAffiliationEvidence(profile.id, affiliation, source)),
    // Patrimônio declarado: AssetDeclaration hoje só existe para o domínio
    // legado Politician (politicianId), não para PoliticalProfile — nenhuma
    // Evidence de categoria "asset" é gerada até essa fonte existir.
  ];
}
