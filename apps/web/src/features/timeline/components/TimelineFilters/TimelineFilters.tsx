import { cn } from "@/lib/utils";
import type { TimelineCategory } from "../../models";
import type { TimelineFilterOption } from "../../view-models";

export interface TimelineFiltersProps {
  options: TimelineFilterOption[];
  selected: TimelineCategory | "all";
  onSelect: (value: TimelineCategory | "all") => void;
}

export function TimelineFilters({ options, selected, onSelect }: TimelineFiltersProps) {
  return (
    <div role="group" aria-label="Filtrar linha do tempo por categoria" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={isSelected}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-transparent text-muted-foreground ring-border hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
