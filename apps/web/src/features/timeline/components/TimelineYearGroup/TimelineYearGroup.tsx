import type { TimelineYearGroupViewModel } from "../../view-models";
import { TimelineEventCard } from "../TimelineEventCard";

export interface TimelineYearGroupProps {
  group: TimelineYearGroupViewModel;
  expandedIds: Set<string>;
  onToggleExpanded: (id: string) => void;
}

export function TimelineYearGroup({ group, expandedIds, onToggleExpanded }: TimelineYearGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h3 className="text-base font-semibold text-foreground">{group.year}</h3>
        <span className="text-xs text-muted-foreground">
          {group.events.length} {group.events.length === 1 ? "acontecimento" : "acontecimentos"}
        </span>
      </div>

      <ol className="relative ml-1.5 flex flex-col border-l border-border pl-4">
        {group.events.map((event) => (
          <TimelineEventCard
            key={event.id}
            event={event}
            expanded={expandedIds.has(event.id)}
            onToggleExpanded={() => onToggleExpanded(event.id)}
          />
        ))}
      </ol>
    </div>
  );
}
