import { Skeleton } from "@/components/ui/skeleton";
import { getHomeMetrics, type HomeMetrics } from "@/lib/home";

const METRIC_ORDER: (keyof HomeMetrics)[] = [
  "profilesAvailable",
  "verifiedEvidences",
  "officialSources",
  "lastUpdated",
];

/**
 * Server Component assíncrono isolado do resto do Hero (docs/SPECs/home.md#performance)
 * — o headline (LCP) renderiza fora do Suspense que envolve este componente,
 * então uma métrica lenta nunca atrasa a pintura do título.
 */
export async function HeroMetrics() {
  const metrics = await getHomeMetrics();

  return (
    <div className="mt-10 flex flex-wrap gap-8 border-t border-border/60 pt-8">
      {METRIC_ORDER.map((key) => {
        const metric = metrics[key];
        return (
          <div key={key}>
            <p className="font-display text-[2rem] font-bold tracking-tight text-foreground">{metric.value}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {metric.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Reserva a mesma altura/estrutura do resultado final — evita layout shift quando a métrica resolve. */
export function HeroMetricsSkeleton() {
  return (
    <div className="mt-10 flex flex-wrap gap-8 border-t border-border/60 pt-8" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}
