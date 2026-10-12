import { ApiProperty } from "@nestjs/swagger";

import { SourceDto } from "../../../common/dto/source.dto";
import { INTEGRITY_CATEGORIES, type IntegrityCategory } from "../domain/integrity-category.enum";
import { INTEGRITY_STATUSES, type IntegrityStatus } from "../domain/integrity-status.enum";

/**
 * DTOs de resposta de Integrity. Nunca reutilizar IntegrityRecord (domínio)
 * ou qualquer tipo Prisma diretamente — o mapeamento fica em
 * political-integrity.mapper.ts.
 */

export class IntegrityEvidenceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  occurredAt: Date;

  @ApiProperty({ type: SourceDto })
  source: SourceDto;
}

export class IntegrityRecordResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: INTEGRITY_CATEGORIES })
  category: IntegrityCategory;

  @ApiProperty({ enum: INTEGRITY_STATUSES })
  status: IntegrityStatus;

  @ApiProperty()
  occurredAt: Date;

  @ApiProperty({ type: SourceDto })
  source: SourceDto;

  @ApiProperty({ type: [IntegrityEvidenceDto] })
  evidences: IntegrityEvidenceDto[];
}
