import { BarChart3, ShieldCheck, RefreshCw, Lock, Share2, Gift } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

// ─── Benefits ────────────────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Dados 100% públicos",
    description:
      "Tudo vem de fontes oficiais: TSE, Câmara, Senado e portais de transparência governamentais.",
  },
  {
    icon: BarChart3,
    title: "Sem viés político",
    description:
      "Nosso algoritmo é auditável. Avaliamos fatos mensuráveis, não declarações ou opiniões.",
  },
  {
    icon: RefreshCw,
    title: "Atualizado constantemente",
    description:
      "ETL automático sincroniza com as APIs do TSE e do Congresso Nacional diariamente.",
  },
  {
    icon: Lock,
    title: "Sua privacidade protegida",
    description:
      "Respostas do quiz são anônimas por padrão. Você controla o que é público.",
  },
  {
    icon: Share2,
    title: "Cola eleitoral compartilhável",
    description:
      "Gere e compartilhe sua lista de candidatos com amigos e família via link único.",
  },
  {
    icon: Gift,
    title: "Gratuito para sempre",
    description:
      "Informação política é um direito. Acesso completo sem custo, para sempre.",
  },
] as const;

// ─── BenefitsSection ──────────────────────────────────────────────────────────

export function BenefitsSection() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Por que usar
          </p>
          <h2 className="mt-2 font-display text-[2rem] font-bold tracking-tight text-foreground">
            Construído para fortalecer a democracia
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <GlassCard
              key={title}
              className="group flex flex-col gap-4 transition-all hover:shadow-lg"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
