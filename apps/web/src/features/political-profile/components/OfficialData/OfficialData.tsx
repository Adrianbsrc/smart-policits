import { GlassCard } from "@/components/ui/glass-card";

/** V1: todo dado do domínio PoliticalProfile vem de fontes referenciadas pelo TSE (candidaturas, filiações, mandatos). */
const OFFICIAL_SOURCE_LABEL = "TSE — Tribunal Superior Eleitoral";

export interface OfficialDataProps {
  /** Data da última atualização do perfil, já formatada (ver ExecutiveSummaryViewModel.lastUpdatedLabel). */
  lastUpdatedLabel: string;
}

/**
 * Seção "Dados oficiais" (docs/SPECs/political-profile.md). Hoje é uma
 * proveniência de plataforma (uma fonte para o domínio inteiro) — quando o
 * Evidence Engine estiver conectado a este domínio, cada fato individual
 * ganha sua própria fonte rastreável (EvidenceSource), e esta seção evolui
 * para listar uma por fato em vez de uma nota única.
 */
export function OfficialData({ lastUpdatedLabel }: OfficialDataProps) {
  return (
    <section aria-labelledby="official-data-heading">
      <GlassCard className="flex flex-col gap-3">
        <h2 id="official-data-heading" className="text-lg font-semibold text-foreground">
          Dados oficiais
        </h2>

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Fonte</dt>
            <dd className="font-medium text-foreground">{OFFICIAL_SOURCE_LABEL}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Última atualização</dt>
            <dd className="font-medium text-foreground">{lastUpdatedLabel}</dd>
          </div>
        </dl>

        <p className="text-xs text-muted-foreground">
          Rastreabilidade por fato individual, com link direto para a fonte de cada informação, chega com o Evidence
          Engine.
        </p>
      </GlassCard>
    </section>
  );
}
