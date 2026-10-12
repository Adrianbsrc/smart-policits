import type { IndicatorCategoryGroupViewModel } from "../../view-models";
import { IndicatorCard } from "../IndicatorCard";

export interface IndicatorCategoryGroupProps {
  group: IndicatorCategoryGroupViewModel;
  expandedIds: Set<string>;
  onToggleExpanded: (id: string) => void;
}

export function IndicatorCategoryGroup({ group, expandedIds, onToggleExpanded }: IndicatorCategoryGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h3 className="text-base font-semibold text-foreground">{group.categoryLabel}</h3>
        <span className="text-xs text-muted-foreground">{group.summary}</span>
      </div>

      <ul className="flex flex-col gap-3">
        {group.indicators.map((indicator) => (
          <IndicatorCard
            key={indicator.id}
            indicator={indicator}
            expanded={expandedIds.has(indicator.id)}
            onToggleExpanded={() => onToggleExpanded(indicator.id)}
          />
        ))}
      </ul>
    </div>
  );
}
