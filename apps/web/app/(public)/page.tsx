import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, BarChart3, ShieldCheck, RefreshCw, Lock, Share2, Gift } from "lucide-react";

export const metadata: Metadata = {
  title: "Vote com consciência — Smart Politics",
  description:
    "Plataforma imparcial para ajudar você a decidir seu voto com base em dados públicos, histórico político e alinhamento de valores.",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <BenefitsSection />
      <RankingPreviewSection />
      <TransparencySection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-40%] left-1/2 h-320 w-7xl -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background-subtle px-4 py-1.5 text-sm text-muted-foreground shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Dados sincronizados com o TSE
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Descubra quais candidatos{" "}
            <span className="text-primary">combinam com seus valores.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Compare candidatos com base em dados públicos, histórico político e prioridades que importam para você. Sem viés, sem achismo.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/quiz"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg active:scale-[0.97]"
            >
              Fazer Quiz Eleitoral
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ranking"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-8 text-base font-medium text-foreground transition-all duration-200 hover:bg-muted hover:border-border-strong active:scale-[0.97]"
            >
              Ver Ranking
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Gratuito · Imparcial · Dados do TSE e fontes oficiais
          </p>
        </div>

        {/* Hero mockup */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-border bg-background-subtle p-1 shadow-2xl ring-1 ring-border/50">
            <div className="overflow-hidden rounded-xl bg-background">
              <div className="flex h-8 items-center gap-1.5 border-b border-border bg-background-subtle px-4">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <div className="ml-3 h-4 w-48 rounded-full bg-muted" />
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Seu alinhamento político</p>
                  <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">Atualizado</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Transparência", score: 8.4, color: "bg-success", pct: 84 },
                    { label: "Educação", score: 7.1, color: "bg-primary", pct: 71 },
                    { label: "Saúde", score: 6.8, color: "bg-warning", pct: 68 },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                        <span className="text-xl font-bold tabular-nums text-foreground">{item.score}</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  {[
                    { name: "João Silva", party: "Partido A", score: 9.2, match: 94 },
                    { name: "Maria Santos", party: "Partido B", score: 8.7, match: 88 },
                    { name: "Carlos Lima", party: "Partido C", score: 8.1, match: 81 },
                  ].map((c, i) => (
                    <div key={c.name} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {c.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.party}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-success">{c.match}% match</span>
                        <span className="text-sm font-bold tabular-nums">{c.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "3.000+", label: "Candidatos analisados" },
    { value: "15M+", label: "Votações monitoradas" },
    { value: "5", label: "Dimensões de avaliação" },
    { value: "100%", label: "Dados públicos" },
  ];

  return (
    <section className="border-y border-border bg-background-subtle py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Responda ao quiz",
      description: "15 perguntas sobre suas prioridades: saúde, educação, segurança, economia e transparência.",
    },
    {
      step: "02",
      title: "Veja seu alinhamento",
      description: "Calculamos quais candidatos mais se alinham com os seus valores em cada tema.",
    },
    {
      step: "03",
      title: "Monte sua cola eleitoral",
      description: "Salve seus candidatos favoritos e compartilhe com amigos e família.",
    },
  ];

  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Como funciona</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Em menos de 5 minutos
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Descubra quais candidatos mais se alinham com seus valores sem precisar pesquisar horas.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.step} className="relative flex flex-col gap-4">
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 hidden h-0.5 w-[calc(100%+2rem)] bg-border md:block" />
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/10 text-sm font-bold text-primary">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/quiz"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
            >
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    {
      icon: ShieldCheck,
      title: "Dados 100% públicos",
      description: "Tudo vem de fontes oficiais: TSE, Câmara, Senado e portais de transparência governamentais.",
    },
    {
      icon: BarChart3,
      title: "Sem viés político",
      description: "Nosso algoritmo é auditável. Avaliamos fatos mensuráveis, não declarações ou opiniões.",
    },
    {
      icon: RefreshCw,
      title: "Atualizado constantemente",
      description: "ETL automático sincroniza com as APIs do TSE e do Congresso Nacional diariamente.",
    },
    {
      icon: Lock,
      title: "Sua privacidade protegida",
      description: "Respostas do quiz são anônimas por padrão. Você controla o que é público.",
    },
    {
      icon: Share2,
      title: "Cola eleitoral compartilhável",
      description: "Gere e compartilhe sua lista de candidatos com amigos e família via link único.",
    },
    {
      icon: Gift,
      title: "Gratuito para sempre",
      description: "Informação política é um direito. Acesso completo sem custo, para sempre.",
    },
  ];

  return (
    <section className="bg-background-subtle py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Por que usar</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Construído para fortalecer a democracia
          </h2>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group flex flex-col gap-4 rounded-xl border border-border bg-background p-6 transition-all duration-200 hover:border-border-strong hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RankingPreviewSection() {
  const candidates = [
    { rank: 1, name: "Ana Oliveira", party: "Partido A", office: "Senadora", state: "SP", score: 9.2, match: 94 },
    { rank: 2, name: "Pedro Costa", party: "Partido B", office: "Deputado Federal", state: "RJ", score: 8.8, match: 88 },
    { rank: 3, name: "Carla Mendes", party: "Partido C", office: "Governadora", state: "MG", score: 8.5, match: 85 },
  ];

  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Ranking</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Os mais bem avaliados
              </h2>
              <p className="mt-3 text-muted-foreground">Com base em dados públicos e histórico político verificável.</p>
            </div>
            <Link
              href="/ranking"
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Ver ranking completo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {candidates.map((c) => (
              <div key={c.name} className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-border-strong hover:shadow-sm">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  c.rank === 1 ? "bg-warning/20 text-warning" :
                  c.rank === 2 ? "bg-muted text-muted-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {c.rank}
                </span>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {c.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.party} · {c.office} · {c.state}</p>
                </div>
                <div className="hidden items-center gap-1.5 sm:flex">
                  <span className="text-xs font-medium text-success">{c.match}% match</span>
                </div>
                <span className="text-xl font-bold tabular-nums text-foreground">{c.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TransparencySection() {
  const items = [
    "Código-fonte público no GitHub",
    "Metodologia documentada e revisada",
    "Fontes 100% governamentais e verificáveis",
    "Sem financiamento partidário ou publicitário",
  ];

  const sources = [
    { name: "TSE", description: "Tribunal Superior Eleitoral" },
    { name: "Câmara", description: "Câmara dos Deputados" },
    { name: "Senado", description: "Senado Federal" },
    { name: "CGU", description: "Controladoria-Geral da União" },
  ];

  return (
    <section className="bg-background-subtle py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Transparência</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Sem caixa preta.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Nosso algoritmo de scoring é público e auditável. Qualquer pessoa pode verificar como calculamos as notas. Nenhum partido ou governo influencia nosso modelo.
              </p>
              <ul className="mt-8 flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle className="h-5 w-5 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/metodologia"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
              >
                Ver metodologia completa
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fontes de dados</p>
              <div className="grid grid-cols-2 gap-3">
                {sources.map((s) => (
                  <div key={s.name} className="flex flex-col gap-1 rounded-xl border border-border bg-background p-4">
                    <span className="text-lg font-bold text-primary">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.description}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Score calculado com base em{" "}
                  <strong className="font-semibold text-foreground">5 dimensões</strong>: educação, saúde, segurança, economia e transparência — com pesos configuráveis pelo usuário.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    question: "Como são calculadas as notas dos candidatos?",
    answer: "As notas são calculadas com base em dados públicos de desempenho legislativo, presença em votações, projetos aprovados, declarações de bens e ficha eleitoral. Cada dimensão contribui igualmente para a nota final — mas você pode personalizar os pesos no quiz.",
  },
  {
    question: "O Smart Politics é parcial politicamente?",
    answer: "Não. Nossa metodologia avalia apenas dados objetivos e mensuráveis. Não há julgamento sobre ideologia — apenas sobre desempenho, transparência e consistência com o histórico.",
  },
  {
    question: "Com que frequência os dados são atualizados?",
    answer: "Os dados são sincronizados automaticamente com as APIs do TSE e do Congresso Nacional. Para votações e presença, a atualização é diária durante períodos de sessão.",
  },
  {
    question: "Posso confiar nos resultados do quiz?",
    answer: "Sim. O quiz é baseado nas propostas e histórico real de votação dos candidatos em temas-chave. As perguntas são elaboradas com base em projetos reais, não em declarações.",
  },
  {
    question: "Meus dados pessoais são seguros?",
    answer: "Sim. Suas respostas do quiz são anônimas por padrão. Se você criar uma conta, seus dados são criptografados e nunca serão vendidos ou compartilhados com terceiros.",
  },
] as const;

function FaqSection() {
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Perguntas frequentes
            </h2>
          </div>
          <div className="mt-12 flex flex-col divide-y divide-border">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground">
                  {item.question}
                  <svg
                    className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-primary py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-white/5" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Pronto para votar com consciência?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
            Responda ao quiz em 5 minutos e descubra quais candidatos mais se alinham com o que você acredita.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/quiz"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-background px-8 text-base font-semibold text-foreground shadow-lg transition-all hover:bg-background/90 active:scale-[0.97]"
            >
              Fazer o Quiz Eleitoral
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ranking"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-primary-foreground/20 px-8 text-base font-medium text-primary-foreground transition-all hover:bg-primary-foreground/10 active:scale-[0.97]"
            >
              Ver ranking de candidatos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
