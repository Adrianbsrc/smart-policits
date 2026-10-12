import type { TimelineEventViewModel } from "./timeline-event.view-model";
import type { TimelineYearGroupViewModel } from "./timeline-group.view-model";

/** Agrupa por ano, mais recente primeiro. Puramente derivado de View Models — não busca dados. */
export function groupTimelineEventsByYear(events: TimelineEventViewModel[]): TimelineYearGroupViewModel[] {
  const groups = new Map<number, TimelineEventViewModel[]>();

  for (const event of events) {
    const bucket = groups.get(event.year);
    if (bucket) bucket.push(event);
    else groups.set(event.year, [event]);
  }

  return [...groups.entries()]
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, yearEvents]) => ({ year, events: yearEvents }));
}
