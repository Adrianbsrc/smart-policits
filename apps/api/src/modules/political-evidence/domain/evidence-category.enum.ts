/**
 * Categorias de Evidence — docs/SPECs/evidence.md#categorias-v1.
 * Uma Evidence pode ter mais de uma categoria (ver `Evidence.categories`).
 */
export const EVIDENCE_CATEGORIES = [
  "biography",
  "professional_career",
  "political_career",
  "government_program",
  "promise",
  "public_expense",
  "asset",
  "indicator",
  "government_decision",
  "appointment",
  "law",
  "decree",
  "interview",
  "public_statement",
  "investigation",
  "judicial_decision",
  "audit",
  "transparency",
  "historical_event",
  "external_event",
] as const;

export type EvidenceCategory = (typeof EVIDENCE_CATEGORIES)[number];
