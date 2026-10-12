import type { IntegrityStatusGroupViewModel } from "../../view-models";
import { IntegrityRecordCard } from "../IntegrityRecordCard";

export interface IntegrityStatusGroupProps {
  group: IntegrityStatusGroupViewModel;
  expandedIds: Set<string>;
  onToggleExpanded: (id: string) => void;
}

export function IntegrityStatusGroup({ group, expandedIds, onToggleExpanded }: IntegrityStatusGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h3 className="text-base font-semibold text-foreground">{group.statusLabel}</h3>
        <span className="text-xs text-muted-foreground">
          {group.count} {group.count === 1 ? "registro" : "registros"}
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {group.records.map((record) => (
          <IntegrityRecordCard
            key={record.id}
            record={record}
            expanded={expandedIds.has(record.id)}
            onToggleExpanded={() => onToggleExpanded(record.id)}
          />
        ))}
      </ul>
    </div>
  );
}
