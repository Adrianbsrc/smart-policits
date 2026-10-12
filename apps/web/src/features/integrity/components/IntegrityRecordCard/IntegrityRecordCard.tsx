import { Badge } from "@/components/ui/badge";
import type { IntegrityRecordViewModel } from "../../view-models";

export interface IntegrityRecordCardProps {
  record: IntegrityRecordViewModel;
  expanded: boolean;
  onToggleExpanded: () => void;
}

/**
 * Nunca usar variant="destructive"/"success"/"warning" aqui — todo status e
 * categoria usam o mesmo estilo neutro ("outline"). A plataforma informa,
 * o usuário conclui: nenhuma cor pode sugerir gravidade ou julgamento.
 */
export function IntegrityRecordCard({ record, expanded, onToggleExpanded }: IntegrityRecordCardProps) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" size="sm">
            {record.statusLabel}
          </Badge>
          <Badge variant="outline" size="sm">
            {record.categoryLabel}
          </Badge>
        </div>
        <time className="text-xs text-muted-foreground">{record.dateLabel}</time>
      </div>

      <span className="text-sm font-medium text-foreground">{record.title}</span>
      <p className="text-sm text-muted-foreground">{record.summary}</p>
      <span className="text-xs text-muted-foreground">Fonte: {record.sourceLabel}</span>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-border pt-3 text-sm text-muted-foreground">
          <p>{record.description}</p>

          {record.evidences.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground">Evidências</span>
              <ul className="flex flex-col gap-2">
                {record.evidences.map((evidence) => (
                  <li key={evidence.id} className="rounded-lg bg-muted/50 p-2">
                    <p className="text-sm font-medium text-foreground">{evidence.title}</p>
                    <p className="text-xs text-muted-foreground">{evidence.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {evidence.dateLabel} · {evidence.sourceLabel}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        className="self-start text-xs font-medium text-primary hover:underline"
      >
        {expanded ? "Ocultar detalhes" : "Ver detalhes"}
      </button>
    </li>
  );
}
