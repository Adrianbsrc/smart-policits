import type { PoliticalProfileCandidate } from "../../domain/political-profile-candidate";
import type { ImportCandidate } from "../contracts/import-candidate.contract";
import type { ImportContext } from "../contracts/import-context.contract";
import type { ImportDecision } from "../contracts/import-decision.contract";
import type { ImportStrategy } from "../contracts/import-strategy.contract";
import { ImportDecisionFactory } from "../decisions/import-decision.factory";
import type { ImportWarning } from "../models/import-warning.model";

/** `ImportCandidate.type` para candidaturas normalizadas (ver domain/political-profile-candidate.ts). */
export const POLITICAL_PROFILE_CANDIDATE_TYPE = "political-profile-candidate";

/** Match é considerado forte o bastante para UPDATE automático sem revisão humana. */
const UPDATE_CONFIDENCE_THRESHOLD = 0.85;

/**
 * Primeira ImportStrategy real da plataforma. Decide o que fazer com um
 * `PoliticalProfileCandidate` (produzido hoje por `TseNormalizer`, ver
 * ../../normalizers/tse/tse.normalizer.ts) — nunca grava nada, apenas decide.
 *
 * Sem `context.entityResolver` (nenhuma implementação existe ainda — esta
 * task não acessa banco) a strategy nunca arrisca CREATE/UPDATE/MERGE
 * automático: ela não teria como saber se o candidato já existe, e assumir
 * CREATE às cegas é exatamente o tipo de duplicação que o Import Engine
 * existe para evitar. Por isso o caminho sem resolver sempre cai em
 * MANUAL_REVIEW — a decisão correta e honesta dado o que se sabe hoje.
 */
export class PoliticalProfileImportStrategy implements ImportStrategy<PoliticalProfileCandidate> {
  readonly type = POLITICAL_PROFILE_CANDIDATE_TYPE;

  async decide(
    candidate: ImportCandidate<PoliticalProfileCandidate>,
    context: ImportContext<PoliticalProfileCandidate>,
  ): Promise<ImportDecision> {
    const profile = candidate.payload;
    const warnings: ImportWarning[] = [];

    if (!profile.fullName.trim() || !profile.ballotName.trim()) {
      return ImportDecisionFactory.manualReview(
        "Candidato sem nome completo ou nome de urna — dado insuficiente para importar automaticamente.",
      );
    }

    if (profile.candidacyStatus === "unknown") {
      warnings.push({
        code: "candidacy-status-unknown",
        message: `Situação da candidatura não reconhecida pelo Normalizer: "${profile.candidacyStatusLabel}".`,
      });
    }

    if (!context.entityResolver) {
      warnings.push({
        code: "entity-resolver-unavailable",
        message: "Nenhum EntityResolver disponível — não é possível confirmar se este candidato já existe na plataforma.",
      });
      return ImportDecisionFactory.manualReview(
        `Candidato "${profile.ballotName}" (${profile.party.acronym}, ${profile.election.year}) requer resolução de identidade antes de decidir CREATE/UPDATE/MERGE.`,
        0.4,
        warnings,
      );
    }

    const matches = await context.entityResolver.resolve(profile);

    if (matches.length === 0) {
      return ImportDecisionFactory.create(
        `Nenhum perfil existente corresponde a "${profile.ballotName}" — candidatura nova.`,
        0.9,
        warnings,
      );
    }

    if (matches.length > 1) {
      warnings.push({
        code: "multiple-entity-matches",
        message: `${matches.length} perfis existentes correspondem a este candidato — necessário Deduplicator/ConflictResolver antes de decidir automaticamente.`,
      });
      return ImportDecisionFactory.manualReview(
        `Múltiplos perfis possíveis para "${profile.ballotName}" — decisão automática não é segura.`,
        Math.max(...matches.map((match) => match.score)),
        warnings,
      );
    }

    const [bestMatch] = matches;
    if (!bestMatch) {
      return ImportDecisionFactory.manualReview("EntityResolver devolveu uma lista de matches inconsistente.", 0, warnings);
    }

    if (bestMatch.score >= UPDATE_CONFIDENCE_THRESHOLD) {
      return ImportDecisionFactory.update(
        bestMatch.entityId,
        `Perfil existente "${bestMatch.entityId}" corresponde com alta confiança (campos: ${bestMatch.matchedOn.join(", ")}) — atualizar.`,
        bestMatch.score,
        warnings,
      );
    }

    warnings.push({
      code: "low-confidence-match",
      message: `Match com "${bestMatch.entityId}" abaixo do limiar de atualização automática (${UPDATE_CONFIDENCE_THRESHOLD}).`,
    });
    return ImportDecisionFactory.manualReview(
      `Correspondência de baixa confiança (${bestMatch.score.toFixed(2)}) com "${bestMatch.entityId}" — revisão manual recomendada.`,
      bestMatch.score,
      warnings,
    );
  }
}
