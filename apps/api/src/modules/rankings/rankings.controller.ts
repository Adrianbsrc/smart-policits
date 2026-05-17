import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { ListRankingsDto } from "./dto/list-rankings.dto";
import { RankingsService } from "./rankings.service";

@ApiTags("rankings")
@Controller("rankings")
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get()
  @ApiOperation({ summary: "Ranking de candidatos por score geral" })
  getRanking(@Query() query: ListRankingsDto) {
    return this.rankingsService.getRanking(query);
  }
}
