import type { LucideIcon } from "lucide-react";
import { CalendarClock, Landmark, Vote, Wallet } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExecutiveSummaryViewModel } from "../../view-models";

export interface QuickFactsProps {
  /** Quando ausente, renderiza o estado de carregamento (skeleton). */
  summary?: ExecutiveSummaryViewModel | null;
}

interface QuickFactCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function QuickFactCard({ icon: Icon, label, value }: QuickFactCardProps) {
  return (
    <GlassCard noPadding className="flex flex-col gap-2 p-4 text-center sm:text-left">
      <Icon className="mx-auto h-5 w-5 text-primary sm:mx-0" aria-hidden />
      <p className="break-words font-display text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </GlassCard>
  );
}

/**
 * Cards resumidos (docs/SPECs/political-profile.md): eleições disputadas,
 * mandatos conhecidos, patrimônio declarado e primeiro mandato — mesmos
 * dados que já viviam na seção "Resumo" de ExecutiveSummary, só
 * reapresentados como destaque visual em vez de lista rótulo/valor.
 */
export function QuickFacts({ summary }: QuickFactsProps) {
  if (!summary) {
    return (
      <section aria-label="Dados em resumo" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </section>
    );
  }

  return (
    <section aria-label="Dados em resumo" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <QuickFactCard icon={Vote} label="Eleições disputadas" value={String(summary.disputedElectionsCount)} />
      <QuickFactCard icon={Landmark} label="Mandatos conhecidos" value={String(summary.mandateCount)} />
      <QuickFactCard icon={Wallet} label="Patrimônio declarado" value={summary.declaredAssetsLabel} />
      <QuickFactCard icon={CalendarClock} label="Primeiro mandato" value={summary.firstMandateLabel} />
    </section>
  );
}
