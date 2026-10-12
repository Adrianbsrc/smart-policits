import Link from "next/link";
import { ShieldCheck, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import { OFFICE_LABELS } from "@/lib/content/labels";
import { GlassCard } from "@/components/ui/glass-card";
import { ScoreRing } from "@/components/ui/score-ring";
import { LiqPill } from "@/components/ui/liq-pill";
import { PoliticianAvatar } from "@/components/politicians/politician-avatar";
import type { RankedPolitician, PoliticianScore } from "@/lib/api/types";
import { Routes } from "@/routes";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PoliticianCardProps {
  candidate: RankedPolitician;
  className?: string;
}

// ─── Pillar config ────────────────────────────────────────────────────────────

const PILLARS = [
  { key: "transparencia" as const, label: "Transparência"  },
  { key: "presenca"      as const, label: "Presença"       },
  { key: "coerencia"     as const, label: "Coerência"      },
  { key: "integridade"   as const, label: "Integridade"    },
  { key: "produtividade" as const, label: "Produtividade"  },
] as const;

type PillarKey = (typeof PILLARS)[number]["key"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPillars(score: PoliticianScore): Record<PillarKey, number> {
  const bd = score.breakdown;
  return {
    transparencia: bd?.transparency    ?? score.transparency    ?? 0,
    presenca:      bd?.activity        ?? score.activity        ?? 0,
    coerencia:     bd?.constitutional  ?? score.constitutional  ?? 0,
    integridade:   Math.min(10, score.integrityMultiplier * 10),
    produtividade: bd?.thematic        ?? 0,
  };
}

function pillarBarColor(value: number): string {
  if (value >= 8) return "bg-primary";
  if (value >= 6) return "bg-foreground/60";
  return "bg-destructive/70";
}

// ─── PoliticianCard ───────────────────────────────────────────────────────────

export function PoliticianCard({ candidate, className }: PoliticianCardProps) {
  const { rank, name, slug, office, state, photoUrl, party, score, fichaLimpaIneligible } = candidate;

  // Score zero para dados mock/indisponível — regra de negócio
  const isMock     = !score || score.scoreType === "mock";
  const overall    = isMock ? null : score.overall;
  const fichaLimpa = !fichaLimpaIneligible;
  const pillars    = !isMock && score ? getPillars(score) : null;
  const rankLabel  = String(rank).padStart(2, "0");
  const isTop3     = rank <= 3;

  return (
    <GlassCard
      className={cn(
        "flex items-start gap-3 px-4 py-4 transition-all duration-200 hover:shadow-lg",
        className,
      )}
    >
      {/* Posição */}
      <span
        className={cn(
          "mt-1 w-8 shrink-0 text-center font-display text-xl font-extrabold tabular-nums tracking-tight",
          isTop3 ? "text-primary" : "text-muted-foreground/40",
        )}
      >
        {rankLabel}
      </span>

      {/* Avatar */}
      <div className="mt-0.5 shrink-0">
        <PoliticianAvatar
          name={name}
          photoUrl={photoUrl}
          size="md"
          ring={isTop3}
        />
      </div>

      {/* Info + pillar bars */}
      <div className="min-w-0 flex-1">
        {/* Nome + badge */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={Routes.legacyPoliticianProfile(slug)}
            className="font-semibold leading-tight text-foreground transition-colors hover:text-primary"
          >
            {name}
          </Link>
          {fichaLimpa && (
            <LiqPill tone="good">
              <ShieldCheck className="h-2.5 w-2.5" />
              Ficha Limpa
            </LiqPill>
          )}
        </div>

        {/* Cargo / Partido / Estado */}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {OFFICE_LABELS[office] ?? office}
          {party && ` · ${party.acronym}`}
          {state && ` · ${state}`}
        </p>

        {/* Barras dos pilares — apenas desktop, apenas dados reais */}
        {pillars && (
          <div className="mt-2.5 hidden flex-col gap-1.5 lg:flex">
            {PILLARS.map(({ key, label }) => {
              const value = pillars[key];
              const pct   = (Math.min(10, value) / 10) * 100;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 text-[10px] text-muted-foreground">
                    {label}
                  </span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all duration-300", pillarBarColor(value))}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-7 shrink-0 text-right text-[10px] font-semibold tabular-nums text-foreground">
                    {value.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {isMock && (
          <p className="mt-1 text-[10px] text-muted-foreground/50">
            dados ainda não disponíveis
          </p>
        )}
      </div>

      {/* Score ring + ações */}
      <div className="flex shrink-0 flex-col items-center gap-3">
        <ScoreRing value={overall} size={56} stroke={5} />

        {/* Ações — desktop */}
        <div className="hidden flex-col gap-1.5 sm:flex">
          <Link
            href={Routes.legacyPoliticianProfile(slug)}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            Ver perfil
          </Link>
          <Link
            href={Routes.compareStart(slug)}
            className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-primary/40 bg-primary/5 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <GitCompare className="h-3.5 w-3.5" />
            Comparar
          </Link>
        </div>

        {/* Mobile — apenas "Ver" */}
        <Link
          href={Routes.legacyPoliticianProfile(slug)}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted sm:hidden"
        >
          Ver
        </Link>
      </div>
    </GlassCard>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function PoliticianCardSkeleton() {
  return (
    <GlassCard className="flex items-start gap-3 px-4 py-4">
      <div className="mt-1 h-6 w-8 skeleton rounded" />
      <div className="mt-0.5 h-11 w-11 skeleton shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2 pt-1">
        <div className="h-4 w-44 skeleton rounded" />
        <div className="h-3 w-32 skeleton rounded" />
        <div className="hidden flex-col gap-1.5 pt-1 lg:flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-24 skeleton rounded" />
              <div className="h-1 flex-1 skeleton rounded-full" />
              <div className="h-3 w-7 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-3">
        <div className="h-14 w-14 skeleton rounded-full" />
        <div className="hidden flex-col gap-1.5 sm:flex">
          <div className="h-8 w-20 skeleton rounded-lg" />
          <div className="h-8 w-20 skeleton rounded-lg" />
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Compact ──────────────────────────────────────────────────────────────────

export function PoliticianCardCompact({ candidate, className }: PoliticianCardProps) {
  const { name, slug, office, state, photoUrl, party, score } = candidate;
  const isMock = !score || score.scoreType === "mock";

  return (
    <Link
      href={Routes.legacyPoliticianProfile(slug)}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-border bg-card/80 p-3 transition-all hover:border-border-strong hover:shadow-sm",
        className,
      )}
    >
      <PoliticianAvatar name={name} photoUrl={photoUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {name}
        </p>
        <p className="text-xs text-muted-foreground">
          {party?.acronym} · {OFFICE_LABELS[office] ?? office}
          {state && ` · ${state}`}
        </p>
      </div>
      <span
        className={cn(
          "font-display text-sm font-bold tabular-nums",
          isMock ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {isMock ? "—" : score!.overall.toFixed(1)}
      </span>
    </Link>
  );
}

// Re-export do avatar para retrocompatibilidade
export { PoliticianAvatar } from "@/components/politicians/politician-avatar";
