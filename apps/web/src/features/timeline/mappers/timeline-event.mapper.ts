import type { TimelineEventDto } from "../validations";
import type { TimelineEventModel } from "../models";

/** Mapper DTO → Domain Model. Nunca produz labels/cores/decisões de UI — isso é trabalho do ViewModel Mapper em view-models/. */
export function mapTimelineEventDtoToModel(dto: TimelineEventDto): TimelineEventModel {
  const occurredAt = new Date(dto.occurredAt);

  return {
    id: dto.id,
    title: dto.title,
    summary: dto.summary,
    occurredAt,
    year: occurredAt.getFullYear(),
    category: dto.category,
    importance: dto.importance,
    source: { name: dto.source.name, url: dto.source.url },
    expandable: dto.expandable,
  };
}
