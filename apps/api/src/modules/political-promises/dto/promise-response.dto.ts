import { ApiProperty } from "@nestjs/swagger";

import { SourceDto } from "../../../common/dto/source.dto";
import { PROMISE_CATEGORIES, type PromiseCategory } from "../domain/promise-category.enum";
import { PROMISE_STATUSES, type PromiseStatus } from "../domain/promise-status.enum";

/**
 * DTOs de resposta de Promises. Nunca reutilizar PromiseEntity (domínio) ou
 * qualquer tipo Prisma diretamente — o mapeamento fica em
 * political-promises.mapper.ts.
 */

export class PromiseEvidenceDto {
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

export class PromiseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: PROMISE_CATEGORIES })
  category: PromiseCategory;

  @ApiProperty({ enum: PROMISE_STATUSES })
  status: PromiseStatus;

  @ApiProperty()
  promisedAt: Date;

  @ApiProperty({ nullable: true, type: Date })
  dueDate: Date | null;

  @ApiProperty({ description: "0-100" })
  completionPercentage: number;

  @ApiProperty({ type: [PromiseEvidenceDto] })
  evidences: PromiseEvidenceDto[];

  @ApiProperty({ type: SourceDto })
  source: SourceDto;
}
