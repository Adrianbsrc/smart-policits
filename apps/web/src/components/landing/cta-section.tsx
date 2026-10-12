import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Routes } from "@/routes";

// ─── CtaSection ───────────────────────────────────────────────────────────────

export function CtaSection() {
  return (
    <section className="relative py-20">
      {/* Subtle gradient bg — extends from hero gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/5" />
      </div>

      <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <GlassCard className="mx-auto max-w-2xl p-10 text-center sm:p-14">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary/15">
            <Zap className="h-6 w-6 text-primary" />
          </div>

          <h2 className="font-display text-[2rem] font-bold tracking-tight text-foreground leading-tight">
            Pronto para votar com consciência?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground leading-relaxed">
            Responda ao quiz em 5 minutos e descubra quais candidatos mais se alinham com o que você acredita.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={Routes.quiz()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-foreground px-8 text-[14px] font-semibold text-background shadow-lg transition-all hover:opacity-90 active:scale-[0.97]"
            >
              Fazer o Quiz Eleitoral
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={Routes.ranking()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-border glass px-8 text-[14px] font-medium text-foreground transition-all hover:bg-muted/60 active:scale-[0.97]"
            >
              Ver ranking de políticos
            </Link>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
