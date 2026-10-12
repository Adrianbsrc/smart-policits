import Link from "next/link";
import { ArrowRight, CheckCircle, Gift, Lock, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Routes } from "@/routes";
import { OFFICIAL_SOURCES } from "@/lib/home";

// ─── Data ─────────────────────────────────────────────────────────────────────

/** Os 5 conceitos que a Home precisa deixar claros (docs/SPECs/home.md#nova-estrutura-proposta). */
const TRUST_ITEMS = [
  "Dados 100% públicos e verificáveis",
  "Fontes oficiais: TSE, Câmara, Senado e CGU",
  "Rastreabilidade por fato, com link direto para a fonte",
  "Metodologia pública e auditável no GitHub",
  "Nenhuma opinião editorial — só fatos mensuráveis",
] as const;

/** Versão reduzida de BenefitsSection — só o que não é redundante com TRUST_ITEMS. */
const REDUCED_BENEFITS = [
  { icon: RefreshCw, text: "Atualizado constantemente com o Congresso e o TSE" },
  { icon: Lock, text: "Suas respostas do quiz são anônimas por padrão" },
  { icon: Gift, text: "Gratuito para sempre" },
] as const;

const PILLAR_NAMES = ["Transparência", "Presença", "Coerência", "Integridade", "Produtividade"] as const;

// ─── TrustSection ───────────────────────────────────────────────────────────

/**
 * Fusão de Transparência + Benefícios (reduzidos) + Pilares (docs/SPECs/home.md).
 * Um único argumento de credibilidade, sem repetir conteúdo em seções
 * separadas — substitui transparency-section.tsx, benefits-section.tsx e
 * stats-section.tsx.
 */
export function TrustSection() {
  return (
    <section className="relative py-20" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">

          {/* Left — argumento de confiança */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Por que confiar
            </p>
            <h2 id="trust-heading" className="mt-2 font-display text-[2rem] font-bold tracking-tight text-foreground leading-tight">
              Sem caixa preta.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Nosso algoritmo de scoring é público e auditável. Qualquer pessoa pode verificar como calculamos as notas. Nenhum partido ou governo influencia nosso modelo.
            </p>

            <ul className="mt-7 flex flex-col gap-2.5">
              {TRUST_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href={Routes.methodology()}
              className="mt-7 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Ver metodologia completa
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <ul className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
              {REDUCED_BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — fontes + pilares */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Fontes de dados
            </p>

            <div className="grid grid-cols-2 gap-3">
              {OFFICIAL_SOURCES.map((source) => (
                <GlassCard key={source.name} className="flex flex-col gap-0.5">
                  <span className="font-display text-lg font-bold text-primary">{source.name}</span>
                  <span className="text-xs text-muted-foreground">{source.description}</span>
                </GlassCard>
              ))}
            </div>

            <GlassCard>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Score calculado com base em{" "}
                <strong className="font-semibold text-foreground">5 pilares iguais</strong>, cada um com peso de 20%.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {PILLAR_NAMES.map((name) => (
                  <li
                    key={name}
                    className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
