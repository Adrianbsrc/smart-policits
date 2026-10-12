import { Injectable } from "@nestjs/common";
import { mapEvidencesToTimelineEvents } from "@smart-politics/core";

import { PoliticalEvidenceService } from "../political-evidence/political-evidence.service";
import { toTimelineEventDtos } from "./political-timeline.mapper";
import type { TimelineEventDto } from "./dto/timeline-event-response.dto";

/**
 * Timeline é sempre construída a partir de Evidence (docs/SPECs/core/timeline.md)
 * — nunca sintetiza eventos a partir de Mandate/PoliticalAffiliation/
 * PoliticalProfile diretamente. A tradução Evidence → Timeline vive em
 * @smart-politics/core (mapEvidencesToTimelineEvents), única implementação
 * no monorepo — este service só busca Evidence e cruza a fronteira de DTO.
 */
@Injectable()
export class PoliticalTimelineService {
  constructor(private readonly politicalEvidenceService: PoliticalEvidenceService) {}

  async getTimeline(slug: string): Promise<TimelineEventDto[]> {
    const evidences = await this.politicalEvidenceService.getEvidenceEntitiesForProfile(slug);
    const events = mapEvidencesToTimelineEvents(evidences);
    return toTimelineEventDtos(events);
  }
}
