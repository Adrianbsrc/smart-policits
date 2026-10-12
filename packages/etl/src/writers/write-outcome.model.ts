import type { ImportAction } from "../import-engine/decisions/import-action.enum";

/**
 * O que de fato aconteceu ao tentar escrever um ImportCandidate — distinto
 * de `ImportAction` (o que a ImportDecision *pedia*): `kind` é o resultado
 * real, que pode divergir da ação pedida (ex.: MERGE ainda não implementado
 * vira `manualReview`; qualquer exceção vira `failed` independente da ação).
 * Genérico o bastante para ser reaproveitado por futuros Writers além de
 * PoliticalProfileWriter.
 */
export type WriteOutcomeKind = "imported" | "updated" | "ignored" | "manualReview" | "failed";

export interface WriteOutcome {
  /** `PoliticalProfileCandidate.id` (ou equivalente de um futuro domínio). */
  candidateId: string;
  action: ImportAction;
  kind: WriteOutcomeKind;
  /** Id do registro no banco — presente apenas quando kind é "imported" ou "updated". */
  entityId?: string;
  /** Presente apenas quando kind é "failed". */
  error?: string;
}
