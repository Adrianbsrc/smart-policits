import type { IntegrityEvidenceDto, IntegrityRecordDto } from "../validations";
import type { IntegrityEvidenceModel, IntegrityRecordModel } from "../models";

/** Mapper DTO → Domain Model. Nunca produz labels/strings de exibição — isso é trabalho do ViewModel Mapper em view-models/. */

function mapIntegrityEvidenceDtoToModel(dto: IntegrityEvidenceDto): IntegrityEvidenceModel {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    occurredAt: new Date(dto.occurredAt),
    source: { name: dto.source.name, url: dto.source.url },
  };
}

export function mapIntegrityRecordDtoToModel(dto: IntegrityRecordDto): IntegrityRecordModel {
  return {
    id: dto.id,
    title: dto.title,
    summary: dto.summary,
    description: dto.description,
    category: dto.category,
    status: dto.status,
    occurredAt: new Date(dto.occurredAt),
    source: { name: dto.source.name, url: dto.source.url },
    evidences: dto.evidences.map(mapIntegrityEvidenceDtoToModel),
  };
}
