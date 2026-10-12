import type {
  EvidenceAttachmentDto,
  EvidenceContextDto,
  EvidenceDto,
  EvidenceSourceDto,
} from "../validations";
import type {
  EvidenceAttachmentModel,
  EvidenceContextModel,
  EvidenceModel,
  EvidenceSourceModel,
} from "../models";

/**
 * Mapper DTO → Domain Model (primeira etapa do fluxo obrigatório desta
 * feature). Nunca produz labels/strings de exibição — isso é trabalho do
 * ViewModel Mapper em view-models/.
 */

function mapEvidenceSourceDtoToModel(dto: EvidenceSourceDto): EvidenceSourceModel {
  return {
    name: dto.name,
    url: dto.url,
    organization: dto.organization,
    type: dto.type,
    reliability: dto.reliability,
    collectedAt: new Date(dto.collectedAt),
    checksum: dto.checksum,
  };
}

function mapEvidenceContextDtoToModel(dto: EvidenceContextDto): EvidenceContextModel {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    type: dto.type,
    scope: dto.scope,
    startDate: new Date(dto.startDate),
    endDate: dto.endDate ? new Date(dto.endDate) : null,
  };
}

function mapEvidenceAttachmentDtoToModel(dto: EvidenceAttachmentDto): EvidenceAttachmentModel {
  return {
    id: dto.id,
    type: dto.type,
    url: dto.url,
    title: dto.title,
    mimeType: dto.mimeType,
    sizeBytes: dto.sizeBytes,
  };
}

export function mapEvidenceDtoToModel(dto: EvidenceDto): EvidenceModel {
  return {
    id: dto.id,
    politicalProfileId: dto.politicalProfileId,
    mandateId: dto.mandateId,
    title: dto.title,
    summary: dto.summary,
    description: dto.description,
    occurredAt: new Date(dto.occurredAt),
    publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
    categories: dto.categories,
    impact: dto.impact,
    reliability: dto.reliability,
    sources: dto.sources.map(mapEvidenceSourceDtoToModel),
    contexts: dto.contexts.map(mapEvidenceContextDtoToModel),
    attachments: dto.attachments.map(mapEvidenceAttachmentDtoToModel),
    tags: dto.tags,
    metadata: dto.metadata,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
