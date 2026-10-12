/**
 * Nível de impacto de uma Evidence. Timeline nunca calcula importância
 * própria — apenas herda este valor via mapEvidenceToTimelineEvent
 * (@smart-politics/core), docs/SPECs/core/timeline.md#fonte-de-verdade.
 */
export const EVIDENCE_IMPACT_LEVELS = ["critical", "high", "medium", "low"] as const;

export type EvidenceImpact = (typeof EVIDENCE_IMPACT_LEVELS)[number];
