import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ScoreRing } from "@/components/ui/score-ring";
import { LiqPill } from "@/components/ui/liq-pill";
import { InitialsAvatar } from "@/components/politicians/politician-avatar";
import { AdSlot } from "@/components/ui/ad-slot";

// ─── Static preview data ──────────────────────────────────────────────────────

const PREVIEW = [
  { rank: 1, name: "Tabata Amaral", party: "PSB", office: "Dep. Federal",  state: "SP", score: 8.8 },
  { rank: 2, name: "Erika Hilton",  party: "PSOL", office: "Dep. Federal", state: "SP", score: 8.7 },
  { rank: 3, name: "Marina Silva",  party: "REDE", office: "Senadora",     state: "AC", score: 8.4 },
  { rank: 4, name: "Alessandro Vieira", party: "MDB", office: "Senador",   state: "SE", score: 8.1 },
  { rank: 5, name: "Tábata Amaral", party: "PSB",  office: "Dep. Federal", state: "SP", score: 7.9 },
] as const;

const RANK_STYLE = [
  "bg-gold/20 text-gold font-bold",
  "bg-muted-foreground/15 text-muted-foreground font-bold",
  "bg-muted/60 text-muted-foreground font-semibold",
] as const;

// ─── RankingPreviewSection ────────────────────────────────────────────────────

export function RankingPreviewSection() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <LiqPill tone="accent" className="mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Ranking ao vivo
            </LiqPill>
            <h2 className="font-display text-[2rem] font-bold tracking-tight text-foreground leading-tight">
              Os mais bem avaliados
            </h2>
            <p className="mt-2 text-muted-foreground">
              Com base em dados públicos e histórico político verificável.
            </p>
          </div>
          <Link
            href="/ranking"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-border glass px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            Ver ranking completo
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* List */}
        <div className="flex flex-col gap-2">
          {PREVIEW.map((c) => {
            const rankStyle = RANK_STYLE[c.rank - 1] ?? "bg-muted/40 text-muted-foreground font-semibold";

            return (
              <GlassCard
                key={c.name}
                noPadding
                className="flex items-center gap-3 px-4 py-3.5 transition-all hover:shadow-md"
              >
                {/* Rank badge */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] text-sm ${rankStyle}`}
                >
                  {c.rank}
                </div>

                {/* Avatar */}
                <InitialsAvatar name={c.name} size="sm" />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {c.office} · {c.party} · {c.state}
                  </p>
                </div>

                {/* Score */}
                <ScoreRing value={c.score} size={44} stroke={4} />
              </GlassCard>
            );
          })}
        </div>

        {/* Ad below ranking preview */}
        <div className="mt-10">
          <AdSlot
            slot="home-rectangle"
            format="rectangle"
            note="300 × 250 · retângulo médio · abaixo do ranking preview"
            className="mx-auto"
          />
        </div>
      </div>
    </section>
  );
}
