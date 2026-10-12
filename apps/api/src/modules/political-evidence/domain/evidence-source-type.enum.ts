/** Tipo de uma EvidenceSource — docs/SPECs/evidence.md#fonte. */
export const EVIDENCE_SOURCE_TYPES = [
  "official_document",
  "public_registry",
  "judicial_record",
  "audit_report",
  "news",
  "interview",
  "social_media",
  "other",
] as const;

export type EvidenceSourceType = (typeof EVIDENCE_SOURCE_TYPES)[number];
