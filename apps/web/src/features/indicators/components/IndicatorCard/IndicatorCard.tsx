import { Badge } from "@/components/ui/badge";
import type { IndicatorViewModel } from "../../view-models";

export interface IndicatorCardProps {
  indicator: IndicatorViewModel;
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function IndicatorCard({ indicator, expanded, onToggleExpanded }: IndicatorCardProps) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{indicator.name}</span>
          <span className="text-xs text-muted-foreground">{indicator.unit}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-lg font-semibold tabular-nums text-foreground">{indicator.currentValueLabel}</span>
          <Badge variant={indicator.trendVariant} size="sm">
            {indicator.trendLabel}
          </Badge>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-border pt-3 text-sm text-muted-foreground">
          <p>{indicator.description}</p>

          {/* Preparado para receber um gráfico de série histórica — ainda não implementado. */}
          <div
            role="img"
            aria-label="Gráfico da série histórica (em breve)"
            className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground"
          >
            Gráfico em breve
          </div>

          {indicator.values.length > 0 && (
            <ul className="flex flex-col gap-1">
              {indicator.values.map((value, index) => (
                <li key={`${value.periodLabel}-${index}`} className="flex items-center justify-between text-xs">
                  <span>{value.periodLabel}</span>
                  <span className="tabular-nums">
                    {value.formattedValue}
                    {value.variationLabel && <span className="ml-2 text-muted-foreground">({value.variationLabel})</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <span className="text-xs italic">Fonte: {indicator.sourceLabel}</span>
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
