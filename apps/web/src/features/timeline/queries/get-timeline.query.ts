import type { Query } from "@/lib/queries";
import { timelineApi } from "../api";
import { mapTimelineEventDtoToModel } from "../mappers";
import { mapTimelineEventModelToViewModel } from "../view-models";
import type { TimelineEventViewModel } from "../view-models";

/** Encapsula o fluxo completo (API → DTO → Mapper → Domain Model → ViewModel) atrás de execute(slug). */
export class GetTimelineQuery implements Query<string, TimelineEventViewModel[]> {
  async execute(slug: string): Promise<TimelineEventViewModel[]> {
    const dtos = await timelineApi.getTimeline(slug);
    return dtos.map(mapTimelineEventDtoToModel).map(mapTimelineEventModelToViewModel);
  }
}

export const getTimelineQuery = new GetTimelineQuery();
