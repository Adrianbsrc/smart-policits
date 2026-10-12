import type { PromiseDto, PromiseEvidenceDto } from "../validations";
import type { PromiseEvidenceModel, PromiseModel } from "../models";

/** Mapper DTO → Domain Model. Nunca produz labels/cores de exibição — isso é trabalho do ViewModel Mapper em view-models/. */

function mapPromiseEvidenceDtoToModel(dto: PromiseEvidenceDto): PromiseEvidenceModel {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    occurredAt: new Date(dto.occurredAt),
    source: { name: dto.source.name, url: dto.source.url },
  };
}

export function mapPromiseDtoToModel(dto: PromiseDto): PromiseModel {
  return {
    id: dto.id,
    title: dto.title,
    summary: dto.summary,
    description: dto.description,
    category: dto.category,
    status: dto.status,
    promisedAt: new Date(dto.promisedAt),
    dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    completionPercentage: dto.completionPercentage,
    evidences: dto.evidences.map(mapPromiseEvidenceDtoToModel),
    source: { name: dto.source.name, url: dto.source.url },
  };
}
