import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliticianAvatar } from "@/components/politicians/politician-avatar";
import type { ExecutiveSummaryViewModel } from "../../view-models";
import { ShareButton } from "../ShareButton";

export interface HeroSectionProps {
  /** Quando ausente, renderiza o estado de carregamento (skeleton). */
  summary?: ExecutiveSummaryViewModel | null;
  /** URL absoluta do perfil — repassada ao ShareButton. */
  shareUrl: string;
}

/**
 * Bloco de identificação no topo da página (docs/SPECs/political-profile.md):
 * foto, nome, partido, cargo, situação e "atualizado em". Biografia e
 * histórico de mandatos aparecem como contexto complementar — mesmo conteúdo
 * que antes vivia em ExecutiveSummary, só reorganizado visualmente.
 */
export function HeroSection({ summary, shareUrl }: HeroSectionProps) {
  if (!summary) {
    return (
      <section aria-labelledby="hero-heading">
        <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
        </GlassCard>
      </section>
    );
  }

  return (
    <section aria-labelledby="hero-heading">
      <GlassCard className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <PoliticianAvatar name={summary.displayName} photoUrl={summary.photoUrl} size="xl" />

          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 id="hero-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
                  {summary.displayName}
                </h1>
                {summary.fullName !== summary.displayName && (
                  <p className="text-sm text-muted-foreground">{summary.fullName}</p>
                )}
              </div>

              <ShareButton url={shareUrl} className="self-start" />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{summary.currentOfficeLabel ?? "Cargo não informado"}</span>
              <span aria-hidden>·</span>
              <span>{summary.currentPartyAcronym ?? "Sem partido"}</span>
              <Badge variant={summary.isIncumbent ? "success" : "default"} size="sm">
                {summary.statusLabel}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">Atualizado em {summary.lastUpdatedLabel}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-border pt-4 text-sm text-muted-foreground">
          <p>{summary.shortBiography ?? "Biografia não disponível."}</p>
          {summary.experienceLine && <p className="text-xs">{summary.experienceLine}</p>}
        </div>
      </GlassCard>
    </section>
  );
}
