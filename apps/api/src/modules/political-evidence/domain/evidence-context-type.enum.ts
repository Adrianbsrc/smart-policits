/** Tipo de evento externo — docs/SPECs/timeline.md#contexto, docs/SPECs/assessment.md#contexto. */
export const EVIDENCE_CONTEXT_TYPES = [
  "pandemic",
  "war",
  "international_crisis",
  "economic_crisis",
  "natural_disaster",
  "constitutional_change",
  "other",
] as const;

export type EvidenceContextType = (typeof EVIDENCE_CONTEXT_TYPES)[number];

/** Abrangência do Context — usada para decidir a quantos perfis ele pode se aplicar. */
export const EVIDENCE_CONTEXT_SCOPES = ["global", "national", "regional", "local"] as const;

export type EvidenceContextScope = (typeof EVIDENCE_CONTEXT_SCOPES)[number];
