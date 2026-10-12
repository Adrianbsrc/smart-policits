import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Routes } from "@/routes";

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    step: "01",
    title: "Responda ao quiz",
    description:
      "15 perguntas sobre suas prioridades: saúde, educação, segurança, economia e transparência.",
  },
  {
    step: "02",
    title: "Veja seu alinhamento",
    description:
      "Calculamos quais políticos mais se alinham com os seus valores em cada tema.",
  },
  {
    step: "03",
    title: "Monte sua cola eleitoral",
    description:
      "Salve seus políticos favoritos e compartilhe com amigos e família.",
  },
] as const;

// ─── HowItWorksSection ───────────────────────────────────────────────────────

export function HowItWorksSection() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Como funciona
          </p>
          <h2 className="mt-2 font-display text-[2rem] font-bold tracking-tight text-foreground">
            Em menos de 5 minutos
          </h2>
          <p className="mt-3 text-muted-foreground">
            Descubra quais candidatos mais se alinham com seus valores sem precisar pesquisar horas.
          </p>
        </div>

        {/* Steps grid */}
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <GlassCard key={step.step} as="li" className="relative flex flex-col gap-3 p-6">
              {/* Connector line — desktop only */}
              {i < STEPS.length - 1 && (
                <div
                  className="absolute right-0 top-10 hidden h-px w-4 translate-x-full bg-border md:block"
                  aria-hidden
                />
              )}

              {/* Step number badge */}
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-primary/20 bg-primary/10 font-display text-sm font-bold text-primary">
                {step.step}
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </GlassCard>
          ))}
        </ol>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href={Routes.quiz()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-primary px-8 text-[14px] font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.97]"
          >
            Começar agora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
