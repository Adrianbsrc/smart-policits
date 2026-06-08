import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import type { PaginatedResponse } from "../../common/dto/pagination.dto";
import { TimelineService } from "./timeline.service";
import { ListTimelineDto } from "./dto/list-timeline.dto";
import type { PoliticalEventResult } from "./timeline.repository";

@ApiTags("timeline")
@Controller("politicians/:slug/timeline")
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  @ApiOperation({ summary: "Timeline de eventos políticos do político" })
  @ApiParam({ name: "slug", description: "Slug do político" })
  getTimeline(
    @Param("slug") slug: string,
    @Query() query: ListTimelineDto,
  ): Promise<PaginatedResponse<PoliticalEventResult>> {
    return this.timelineService.getTimeline(slug, query);
  }
}
