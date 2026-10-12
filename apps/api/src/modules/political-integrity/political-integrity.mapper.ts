import type { IntegrityEvidence, IntegrityRecord } from "./domain/integrity-record.entity";
import type { IntegrityEvidenceDto, IntegrityRecordResponseDto } from "./dto/integrity-record-response.dto";

function toIntegrityEvidenceDto(evidence: IntegrityEvidence): IntegrityEvidenceDto {
  return {
    id: evidence.id,
    title: evidence.title,
    description: evidence.description,
    occurredAt: evidence.occurredAt,
    source: evidence.source,
  };
}

function toIntegrityRecordDto(record: IntegrityRecord): IntegrityRecordResponseDto {
  return {
    id: record.id,
    title: record.title,
    summary: record.summary,
    description: record.description,
    category: record.category,
    status: record.status,
    occurredAt: record.occurredAt,
    source: record.source,
    evidences: record.evidences.map(toIntegrityEvidenceDto),
  };
}

export function toIntegrityRecordDtos(records: IntegrityRecord[]): IntegrityRecordResponseDto[] {
  return records.map(toIntegrityRecordDto);
}
