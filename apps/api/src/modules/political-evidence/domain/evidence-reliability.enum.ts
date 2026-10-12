/**
 * Confiabilidade de uma Evidence — docs/SPECs/evidence.md#confiança.
 * Depende exclusivamente da origem do dado; a IA nunca define este valor.
 */
export const EVIDENCE_RELIABILITY_LEVELS = ["official", "high", "medium", "low"] as const;

export type EvidenceReliability = (typeof EVIDENCE_RELIABILITY_LEVELS)[number];
