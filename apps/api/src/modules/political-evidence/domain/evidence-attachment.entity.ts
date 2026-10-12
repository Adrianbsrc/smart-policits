import type { EvidenceAttachmentType } from "./evidence-attachment-type.enum";

/**
 * Anexo de uma Evidence (PDF, vídeo, áudio, documento, imagem). Apenas
 * estrutura — upload/armazenamento não é implementado nesta task.
 */
export interface EvidenceAttachment {
  id: string;
  type: EvidenceAttachmentType;
  url: string;
  title: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
}
