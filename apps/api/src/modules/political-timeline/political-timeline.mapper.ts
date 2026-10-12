import type { TimelineEvent } from "@smart-politics/core";
import type { TimelineEventDto } from "./dto/timeline-event-response.dto";

/**
 * Domain (TimelineEvent, @smart-politics/core) → DTO de resposta HTTP.
 * Mapeamento 1:1 — a tradução de verdade (categoria/importância/fonte) já
 * aconteceu em mapEvidenceToTimelineEvent; este mapper só cruza a fronteira
 * de domínio → DTO, mesmo padrão de toEvidenceDto.
 */
export function toTimelineEventDto(event: TimelineEvent): TimelineEventDto {
  return {
    id: event.id,
    title: event.title,
    summary: event.summary,
    occurredAt: event.occurredAt,
    category: event.category,
    importance: event.importance,
    source: { name: event.source.name, url: event.source.url },
    expandable: event.expandable,
  };
}

export function toTimelineEventDtos(events: TimelineEvent[]): TimelineEventDto[] {
  return events.map(toTimelineEventDto);
}
