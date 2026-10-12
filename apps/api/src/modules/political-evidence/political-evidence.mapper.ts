import type { Evidence, EvidenceAttachment, EvidenceContext, EvidenceSource } from "./domain";
import type {
  EvidenceAttachmentDto,
  EvidenceContextDto,
  EvidenceResponseDto,
  EvidenceSourceDto,
} from "./dto/evidence-response.dto";

function toEvidenceSourceDto(source: EvidenceSource): EvidenceSourceDto {
  return {
    name: source.name,
    url: source.url,
    organization: source.organization,
    type: source.type,
    reliability: source.reliability,
    collectedAt: source.collectedAt,
    checksum: source.checksum,
  };
}

function toEvidenceContextDto(context: EvidenceContext): EvidenceContextDto {
  return {
    id: context.id,
    title: context.title,
    description: context.description,
    type: context.type,
    scope: context.scope,
    startDate: context.startDate,
    endDate: context.endDate,
  };
}

function toEvidenceAttachmentDto(attachment: EvidenceAttachment): EvidenceAttachmentDto {
  return {
    id: attachment.id,
    type: attachment.type,
    url: attachment.url,
    title: attachment.title,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
  };
}

function toEvidenceDto(evidence: Evidence): EvidenceResponseDto {
  return {
    id: evidence.id,
    politicalProfileId: evidence.politicalProfileId,
    mandateId: evidence.mandateId,
    title: evidence.title,
    summary: evidence.summary,
    description: evidence.description,
    occurredAt: evidence.occurredAt,
    publishedAt: evidence.publishedAt,
    categories: evidence.categories,
    impact: evidence.impact,
    reliability: evidence.reliability,
    sources: evidence.sources.map(toEvidenceSourceDto),
    contexts: evidence.contexts.map(toEvidenceContextDto),
    attachments: evidence.attachments.map(toEvidenceAttachmentDto),
    tags: evidence.tags,
    metadata: evidence.metadata,
    createdAt: evidence.createdAt,
    updatedAt: evidence.updatedAt,
  };
}

export function toEvidenceDtos(evidences: Evidence[]): EvidenceResponseDto[] {
  return evidences.map(toEvidenceDto);
}

export { toEvidenceDto };
