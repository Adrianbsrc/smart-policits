import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

import { PoliticalTimelineService } from "./political-timeline.service";
import { TimelineEventDto } from "./dto/timeline-event-response.dto";

@ApiTags("political-timeline")
@Controller("profiles")
export class PoliticalTimelineController {
  constructor(private readonly politicalTimelineService: PoliticalTimelineService) {}

  @Get(":slug/timeline")
  @ApiOperation({ summary: "Linha do tempo do perfil político (construída a partir de Evidence)" })
  @ApiParam({ name: "slug" })
  @ApiOkResponse({ type: [TimelineEventDto] })
  getTimeline(@Param("slug") slug: string): Promise<TimelineEventDto[]> {
    return this.politicalTimelineService.getTimeline(slug);
  }
}
