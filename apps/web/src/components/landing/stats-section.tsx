import { GlassCard } from "@/components/ui/glass-card";
import { AdSlot } from "@/components/ui/ad-slot";

// ─── Pilares ──────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    id: "01",
    name: "Transparência",
    desc: "Declarações, gastos e reuniões públicas",
  },
  {
    id: "02",
    name: "Presença",
    desc: "Frequência nas sessões e comissões",
  },
  {
    id: "03",
    name: "Coerência",
    desc: "Votações vs. histórico declarado",
  },
  {
    id: "04",
    name: "Integridade",
    desc: "Ficha Limpa e processos judiciais",
  },
  {
    id: "05",
    name: "Produtividade",
    desc: "Propostas e atuação temática",
  },
] as const;

// ─── StatsSection (Pilares Strip) ────────────────────────────────────────────

export function StatsSection() {
  return (
    <section className="relative py-14">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">

        {/* Pilares strip */}
        <GlassCard className="p-6 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            {/* Título esquerda */}
            <div className="shrink-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Avaliamos
              </p>
              <p className="mt-1 font-display text-[1.4rem] font-bold leading-tight tracking-tight text-foreground">
                Cinco pilares objetivos
              </p>
            </div>

            {/* Chips dos pilares */}
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {PILLARS.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-0.5 rounded-[14px] border border-border bg-muted/40 px-3.5 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="text-[10.5px] font-bold text-primary">{p.id}</span>
                  <span className="text-[13px] font-semibold text-foreground leading-tight">
                    {p.name}
                  </span>
                  <span className="hidden text-[11px] text-muted-foreground sm:block">
                    {p.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Ad leaderboard below pilares */}
        <div className="mt-8">
          <AdSlot
            slot="home-leaderboard"
            format="leaderboard"
            note="728 × 90 · leaderboard · abaixo da faixa de pilares"
          />
        </div>
      </div>
    </section>
  );
}
