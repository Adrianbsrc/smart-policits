import { ApiProperty } from "@nestjs/swagger";

import { SourceDto } from "../../../common/dto/source.dto";
import { INDICATOR_CATEGORIES, type IndicatorCategory } from "../domain/indicator-category.enum";

/**
 * DTOs de resposta de Indicators. Nunca reutilizar Indicator (domínio) ou
 * qualquer tipo Prisma diretamente — o mapeamento fica em
 * political-indicators.mapper.ts.
 */

export class IndicatorValueDto {
  @ApiProperty()
  period: string;

  @ApiProperty()
  value: number;

  @ApiProperty({ nullable: true, type: Number })
  variation: number | null;

  @ApiProperty({ nullable: true, type: String })
  notes: string | null;
}

export class IndicatorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: INDICATOR_CATEGORIES })
  category: IndicatorCategory;

  @ApiProperty()
  description: string;

  @ApiProperty()
  unit: string;

  @ApiProperty({ type: [IndicatorValueDto] })
  values: IndicatorValueDto[];

  @ApiProperty({ type: SourceDto })
  source: SourceDto;
}
