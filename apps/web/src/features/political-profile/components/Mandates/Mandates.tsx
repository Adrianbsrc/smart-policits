import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import type { MandateViewModel } from "../../view-models";

export interface MandatesProps {
  /** Quando ausente/vazio, renderiza o estado vazio. */
  mandates?: MandateViewModel[];
}

export function Mandates({ mandates = [] }: MandatesProps) {
  return (
    <section aria-labelledby="mandates-heading">
      <GlassCard className="flex flex-col gap-4">
        <h2 id="mandates-heading" className="text-lg font-semibold text-foreground">
          Mandatos
        </h2>

        {mandates.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum mandato registrado até o momento.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {mandates.map((mandate) => (
              <li key={mandate.id} className="flex flex-col gap-2 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{mandate.officeLabel}</span>
                  <span className="text-sm text-muted-foreground">{mandate.period}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {mandate.reelected && (
                    <Badge variant="primary" size="sm">
                      Reeleito
                    </Badge>
                  )}
                  {mandate.electoralResultLabel && (
                    <Badge variant="outline" size="sm">
                      {mandate.electoralResultLabel}
                    </Badge>
                  )}
                  {mandate.electionYear && <span>Eleição {mandate.electionYear}</span>}
                </div>
                {mandate.description && <p className="text-sm text-muted-foreground">{mandate.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </section>
  );
}
