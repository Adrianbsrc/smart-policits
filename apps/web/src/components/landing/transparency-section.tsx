import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRANSPARENCY_ITEMS = [
  "Código-fonte público no GitHub",
  "Metodologia documentada e revisada",
  "Fontes 100% governamentais e verificáveis",
  "Sem financiamento partidário ou publicitário",
] as const;

const SOURCES = [
  { name: "TSE",    description: "Tribunal Superior Eleitoral" },
  { name: "Câmara", description: "Câmara dos Deputados" },
  { name: "Senado", description: "Senado Federal" },
  { name: "CGU",    description: "Controladoria-Geral da União" },
] as const;

// ─── TransparencySection ──────────────────────────────────────────────────────

export function TransparencySection() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">

          {/* Left — text */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Transparência
            </p>
            <h2 className="mt-2 font-display text-[2rem] font-bold tracking-tight text-foreground leading-tight">
              Sem caixa preta.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Nosso algoritmo de scoring é público e auditável. Qualquer pessoa pode verificar como calculamos as notas. Nenhum partido ou governo influencia nosso modelo.
            </p>

            <ul className="mt-7 flex flex-col gap-2.5">
              {TRANSPARENCY_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/metodologia"
              className="mt-7 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Ver metodologia completa
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Right — sources */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Fontes de dados
            </p>

            <div className="grid grid-cols-2 gap-3">
              {SOURCES.map((s) => (
                <GlassCard key={s.name} className="flex flex-col gap-0.5">
                  <span className="font-display text-lg font-bold text-primary">{s.name}</span>
                  <span className="text-xs text-muted-foreground">{s.description}</span>
                </GlassCard>
              ))}
            </div>

            <GlassCard>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Score calculado com base em{" "}
                <strong className="font-semibold text-foreground">5 pilares iguais</strong>: Transparência,
                Presença, Coerência, Integridade e Produtividade — cada um com peso de 20%.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
