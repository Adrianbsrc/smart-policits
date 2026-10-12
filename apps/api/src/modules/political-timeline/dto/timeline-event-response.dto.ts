import { ApiProperty } from "@nestjs/swagger";
import { TIMELINE_CATEGORIES, TIMELINE_IMPORTANCE_LEVELS } from "@smart-politics/core";
import type { TimelineCategory, TimelineImportance } from "@smart-politics/core";

import { SourceDto } from "../../../common/dto/source.dto";

/**
 * DTO de resposta da Timeline. Vocabulário de categoria/importância vem de
 * @smart-politics/core (fonte única, docs/SPECs/core/timeline.md) — nunca
 * redeclarado aqui. TimelineEvent (domínio) é sempre construído a partir de
 * Evidence via mapEvidenceToTimelineEvent — nunca sintetizado a partir de
 * Mandate/PoliticalAffiliation/PoliticalProfile diretamente.
 */
export class TimelineEventDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  occurredAt: Date;

  @ApiProperty({ enum: TIMELINE_CATEGORIES })
  category: TimelineCategory;

  @ApiProperty({ enum: TIMELINE_IMPORTANCE_LEVELS })
  importance: TimelineImportance;

  @ApiProperty({ type: SourceDto })
  source: SourceDto;

  @ApiProperty({ description: "Indica se há conteúdo (summary) para expandir na UI" })
  expandable: boolean;
}
