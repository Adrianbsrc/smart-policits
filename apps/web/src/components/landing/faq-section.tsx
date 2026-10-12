import { GlassCard } from "@/components/ui/glass-card";

// ─── FAQ data ─────────────────────────────────────────────────────────────────

/** Exportado para reuso no FAQPage JSON-LD (page.tsx) — mesmo conteúdo, sem duplicar. */
export const FAQ_ITEMS = [
  {
    question: "Como são calculadas as notas dos políticos?",
    answer:
      "As notas são calculadas com base em dados públicos de desempenho legislativo, presença em votações, projetos aprovados, declarações de bens e ficha eleitoral. O Score 2.0 usa 5 pilares estruturais com peso igual de 20% cada e um multiplicador de integridade — você também pode personalizar os pesos no quiz.",
  },
  {
    question: "O Smart Politics é parcial politicamente?",
    answer:
      "Não. Nossa metodologia avalia apenas dados objetivos e mensuráveis. Não há julgamento sobre ideologia — apenas sobre desempenho, transparência e consistência com o histórico.",
  },
  {
    question: "Com que frequência os dados são atualizados?",
    answer:
      "Os dados são sincronizados automaticamente com as APIs do TSE e do Congresso Nacional. Para votações e presença, a atualização é diária durante períodos de sessão.",
  },
  {
    question: "Posso confiar nos resultados do quiz?",
    answer:
      "Sim. O quiz é baseado nas propostas e histórico real de votação dos candidatos em temas-chave. As perguntas são elaboradas com base em projetos reais, não em declarações.",
  },
  {
    question: "Meus dados pessoais são seguros?",
    answer:
      "Sim. Suas respostas do quiz são anônimas por padrão. Se você criar uma conta, seus dados são criptografados e nunca serão vendidos ou compartilhados com terceiros.",
  },
] as const;

// ─── FaqSection ───────────────────────────────────────────────────────────────

export function FaqSection() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">FAQ</p>
            <h2 className="mt-2 font-display text-[2rem] font-bold tracking-tight text-foreground">
              Perguntas frequentes
            </h2>
          </div>

          <GlassCard noPadding className="divide-y divide-border overflow-hidden">
            {FAQ_ITEMS.map((item, i) => (
              <details key={item.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted/30">
                  {item.question}
                  <svg
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-6 pb-5 pt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
