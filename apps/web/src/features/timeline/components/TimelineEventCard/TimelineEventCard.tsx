import { Badge } from "@/components/ui/badge";
import type { TimelineEventViewModel, TimelineImportanceVariant } from "../../view-models";

export interface TimelineEventCardProps {
  event: TimelineEventViewModel;
  expanded: boolean;
  onToggleExpanded: () => void;
}

/** Cor do marcador da espinha — reaproveita importanceVariant, já calculado no view-mapper para o Badge. */
const IMPORTANCE_DOT_COLOR: Record<TimelineImportanceVariant, string> = {
  destructive: "bg-destructive",
  warning: "bg-warning",
  default: "bg-primary",
  outline: "bg-border",
};

export function TimelineEventCard({ event, expanded, onToggleExpanded }: TimelineEventCardProps) {
  return (
    <li className="relative pb-6 pl-6 last:pb-0">
      <span
        className={`absolute left-0 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-background ${IMPORTANCE_DOT_COLOR[event.importanceVariant]}`}
        aria-hidden
      />

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-background/50 p-4 transition-colors hover:border-border-strong">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">{event.title}</span>
            <Badge variant={event.importanceVariant} size="sm">
              {event.importanceLabel}
            </Badge>
            <Badge variant="outline" size="sm">
              {event.categoryLabel}
            </Badge>
          </div>
          <time dateTime={event.occurredAt.toISOString()} className="shrink-0 text-xs text-muted-foreground">
            {event.dateLabel}
          </time>
        </div>

        {expanded && (
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <p>{event.summary}</p>
            <span className="text-xs italic">Fonte: {event.sourceLabel}</span>
          </div>
        )}

        {event.expandable && (
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-expanded={expanded}
            className="self-start text-xs font-medium text-primary hover:underline"
          >
            {expanded ? "Ver menos" : "Ver mais"}
          </button>
        )}
      </div>
    </li>
  );
}
