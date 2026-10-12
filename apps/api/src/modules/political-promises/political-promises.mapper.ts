import type { PromiseEntity, PromiseEvidence } from "./domain/promise.entity";
import type { PromiseEvidenceDto, PromiseResponseDto } from "./dto/promise-response.dto";

function toPromiseEvidenceDto(evidence: PromiseEvidence): PromiseEvidenceDto {
  return {
    id: evidence.id,
    title: evidence.title,
    description: evidence.description,
    occurredAt: evidence.occurredAt,
    source: evidence.source,
  };
}

function toPromiseDto(promise: PromiseEntity): PromiseResponseDto {
  return {
    id: promise.id,
    title: promise.title,
    summary: promise.summary,
    description: promise.description,
    category: promise.category,
    status: promise.status,
    promisedAt: promise.promisedAt,
    dueDate: promise.dueDate,
    completionPercentage: promise.completionPercentage,
    evidences: promise.evidences.map(toPromiseEvidenceDto),
    source: promise.source,
  };
}

export function toPromiseDtos(promises: PromiseEntity[]): PromiseResponseDto[] {
  return promises.map(toPromiseDto);
}
