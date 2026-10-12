import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ui/score-bar";
import type { PromiseViewModel } from "../../view-models";

export interface PromiseCardProps {
  promise: PromiseViewModel;
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function PromiseCard({ promise, expanded, onToggleExpanded }: PromiseCardProps) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{promise.title}</span>
          <p className="text-sm text-muted-foreground">{promise.summary}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={promise.statusVariant} size="sm">
              {promise.statusLabel}
            </Badge>
            <Badge variant="outline" size="sm">
              {promise.categoryLabel}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
          <span>{promise.dateLabel}</span>
          {promise.dueDateLabel && <span>Prazo: {promise.dueDateLabel}</span>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ScoreBar
          label="Progresso"
          score={promise.completionPercentage}
          max={100}
          size="sm"
          showValue={false}
          className="flex-1"
        />
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {promise.completionPercentage}%
        </span>
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-border pt-3 text-sm text-muted-foreground">
          <p>{promise.description}</p>

          {promise.evidences.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground">Evidências</span>
              <ul className="flex flex-col gap-2">
                {promise.evidences.map((evidence) => (
                  <li key={evidence.id} className="rounded-lg bg-muted/50 p-2">
                    <p className="text-sm font-medium text-foreground">{evidence.title}</p>
                    <p className="text-xs text-muted-foreground">{evidence.description}</p>
                    <p className="text-xs text-muted-foreground">{evidence.dateLabel}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <span className="text-xs italic">Fonte: {promise.sourceLabel}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        className="self-start text-xs font-medium text-primary hover:underline"
      >
        {expanded ? "Ver menos" : "Ver mais"}
      </button>
    </li>
  );
}
