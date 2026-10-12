import type { TimelineEventViewModel } from "./timeline-event.view-model";

export interface TimelineYearGroupViewModel {
  year: number;
  events: TimelineEventViewModel[];
}
