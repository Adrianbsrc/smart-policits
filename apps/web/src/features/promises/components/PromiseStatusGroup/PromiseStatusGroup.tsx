import type { PromiseStatusGroupViewModel } from "../../view-models";
import { PromiseCard } from "../PromiseCard";

export interface PromiseStatusGroupProps {
  group: PromiseStatusGroupViewModel;
  expandedIds: Set<string>;
  onToggleExpanded: (id: string) => void;
}

export function PromiseStatusGroup({ group, expandedIds, onToggleExpanded }: PromiseStatusGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h3 className="text-base font-semibold text-foreground">{group.statusLabel}</h3>
        <span className="text-xs text-muted-foreground">
          {group.promises.length} {group.promises.length === 1 ? "promessa" : "promessas"}
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {group.promises.map((promise) => (
          <PromiseCard
            key={promise.id}
            promise={promise}
            expanded={expandedIds.has(promise.id)}
            onToggleExpanded={() => onToggleExpanded(promise.id)}
          />
        ))}
      </ul>
    </div>
  );
}
