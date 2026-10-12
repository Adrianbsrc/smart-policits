/** Tipo de anexo de uma Evidence. Arquitetura apenas — upload não implementado. */
export const EVIDENCE_ATTACHMENT_TYPES = ["pdf", "video", "audio", "document", "image"] as const;

export type EvidenceAttachmentType = (typeof EVIDENCE_ATTACHMENT_TYPES)[number];
