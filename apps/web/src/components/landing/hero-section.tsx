import Link from "next/link";
import { ArrowRight, Timer, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ScoreRing } from "@/components/ui/score-ring";
import { LiqPill } from "@/components/ui/liq-pill";
import { InitialsAvatar } from "@/components/politicians/politician-avatar";
import { AdSlot } from "@/components/ui/ad-slot";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysUntilElection(): number {
  const election = new Date("2026-10-04T00:00:00-03:00");
  const now = new Date();
  const diff = election.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── Dados do pódio (preview estático) ──────────────────────────────────────

const PODIUM = [
  { name: "Tabata Amaral",  role: "Dep. Federal", party: "PSB", state: "SP", score: 8.8, delta: +5 },
  { name: "Erika Hilton",   role: "Dep. Federal", party: "PSOL", state: "SP", score: 8.7, delta: +3 },
  { name: "Marina Silva",   role: "Senadora",      party: "REDE", state: "AC", score: 8.4, delta: +2 },
] as const;

const METRICS = [
  { value: "594",  label: "parlamentares" },
  { value: "12",   label: "fontes de dados" },
  { value: "0",    label: "viés político" },
] as const;

// ─── PodiumCard ───────────────────────────────────────────────────────────────

function PodiumCard() {
  return (
    <GlassCard className="w-full p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-muted-foreground">
          Pódio · esta semana
        </span>
        <LiqPill tone="good">▲ atualizado</LiqPill>
      </div>

      <div className="flex flex-col gap-1.5">
        {PODIUM.map((p, i) => {
          const rankColors = ["bg-gold text-white", "bg-muted-foreground/60 text-white", "bg-muted text-muted-foreground"] as const;
          const isFirst = i === 0;
          return (
            <div
              key={p.name}
              className={`flex items-center gap-3 rounded-2xl p-3 ${
                isFirst
                  ? "border border-primary/20 bg-primary/5"
                  : "border border-transparent"
              }`}
            >
              {/* Posição */}
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] font-display text-sm font-bold ${rankColors[i]}`}>
                {i + 1}
              </div>

              {/* Avatar */}
              <InitialsAvatar name={p.name} size="sm" />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">{p.role} · {p.party} · {p.state}</p>
              </div>

              {/* Score */}
              <ScoreRing
                value={p.score}
                size={44}
                stroke={4}
              />
            </div>
          );
        })}
      </div>

      <Link
        href="/ranking"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        Ver ranking completo
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </GlassCard>
  );
}

// ─── HeroSection ─────────────────────────────────────────────────────────────

export function HeroSection() {
  const daysLeft = getDaysUntilElection();

  return (
    <section className="relative overflow-hidden">
      {/* Fundo Liquid */}
      <div className="page-gradient pointer-events-none absolute inset-0" aria-hidden />
      <div className="dot-pattern pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      <div className="relative mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

        {/* ── 2 colunas: texto + pódio ── */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">

          {/* Coluna esquerda — texto */}
          <div className="flex flex-col">
            {/* Pills de status */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <LiqPill tone="accent">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Eleições 2026 · {daysLeft} dias
              </LiqPill>
              <LiqPill tone="neutral">
                <Timer className="h-3 w-3" />
                Dados do TSE e Congresso
              </LiqPill>
            </div>

            {/* Headline */}
            <h1 className="font-display text-[clamp(3rem,6vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-foreground">
              Vote com{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                clareza.
              </span>
            </h1>

            {/* Sub */}
            <p className="mt-5 max-w-lg text-[18px] leading-relaxed text-muted-foreground">
              594 parlamentares avaliados em 5 pilares com dados públicos do Congresso, TSE e tribunais.
              Sem opinião, sem inclinação partidária.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/quiz"
                className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-foreground px-6 text-[14px] font-semibold text-background shadow-lg transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
              >
                Começar pelo quiz
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/ranking"
                className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-border glass px-6 text-[14px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/60 active:scale-[0.97]"
              >
                Explorar ranking
              </Link>
            </div>

            {/* Métricas */}
            <div className="mt-10 flex flex-wrap gap-8 border-t border-border/60 pt-8">
              {METRICS.map((m) => (
                <div key={m.label}>
                  <p className="font-display text-[2rem] font-bold tracking-tight text-foreground">{m.value}</p>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna direita — pódio */}
          <div className="lg:pl-4">
            <PodiumCard />
          </div>
        </div>

        {/* ── Billboard ad ── */}
        <div className="mt-12">
          <AdSlot
            slot="home-billboard"
            format="billboard"
            note="970 × 250 · slot principal acima da dobra · alta visibilidade"
          />
        </div>
      </div>
    </section>
  );
}
