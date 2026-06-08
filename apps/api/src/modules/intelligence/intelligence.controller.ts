import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { JwtAuthGuard } from "../auth/auth.guard";
import { InterpretDto } from "./dto/interpret.dto";
import { ListInterpretationsDto } from "./dto/list-interpretations.dto";
import { IntelligenceService, type InterpretationListItem } from "./intelligence.service";

@ApiTags("intelligence")
@Controller("intelligence")
@UseGuards(JwtAuthGuard)
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Post("interpret")
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @ApiOperation({
    summary: "Interpreta um evento político (PL, votação, decreto, notícia)",
  })
  interpret(@Body() dto: InterpretDto) {
    return this.intelligenceService.interpret({
      type: dto.type,
      title: dto.title,
      description: dto.description,
      date: dto.date,
      politicians: dto.politicians,
    });
  }

  @Post("story")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({
    summary: "Gera story/card para o feed a partir de um evento político",
  })
  generateStory(@Body() dto: InterpretDto) {
    return this.intelligenceService.generateStory({
      type: dto.type,
      title: dto.title,
      description: dto.description,
      date: dto.date,
      politicians: dto.politicians,
    });
  }

  @Get("interpretations")
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @ApiOperation({ summary: "Lista interpretações salvas (admin)" })
  listInterpretations(@Query() query: ListInterpretationsDto): Promise<InterpretationListItem[]> {
    return this.intelligenceService.listInterpretations(
      query.inputType,
      query.skip,
      query.take,
    );
  }
}
