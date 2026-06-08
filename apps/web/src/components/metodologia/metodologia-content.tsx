import { CheckCircle, ShieldCheck, ShieldAlert, ShieldX, Eye, Activity, Scale, Star, BarChart2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AdSlot } from "@/components/ui/ad-slot";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    num: "01",
    name: "Transparência",
    weight: "20%",
    icon: Eye,
    description: "Publicação de dados, acesso à informação, declarações de bens condizentes e ficha pública limpa.",
  },
  {
    num: "02",
    name: "Presença",
    weight: "20%",
    icon: Activity,
    description: "Taxa de presença em votações, projetos de lei propostos e aprovados, participação em comissões.",
  },
  {
    num: "03",
    name: "Coerência",
    weight: "20%",
    icon: Scale,
    description: "Votos alinhados à Constituição Federal de 1988 e ao Estado Democrático de Direito.",
  },
  {
    num: "04",
    name: "Integridade",
    weight: "20%",
    icon: Star,
    description: "Multiplicador de 0.3 a 1.0 aplicado sobre o score base, baseado em penalidades judiciais e registro eleitoral.",
  },
  {
    num: "05",
    name: "Produtividade",
    weight: "20%",
    icon: BarChart2,
    description: "Nota consolidada das 13 dimensões temáticas: saúde, educação, meio ambiente e outros.",
  },
] as const;

const PENALTIES = [
  { name: "Condenações criminais", max: "−40%", desc: "Condenações transitadas em julgado em instâncias superiores" },
  { name: "Indiciamentos",         max: "−25%", desc: "Indiciamentos por órgãos investigativos como PGR e MPF" },
  { name: "Fichas Sujas (TSE)",    max: "−15%", desc: "Registros no banco de fichas sujas do TSE" },
  { name: "Decisões do TCU",       max: "−15%", desc: "Irregularidades ou sanções pela Controladoria-Geral da União" },
  { name: "Processo ético",        max: "−10%", desc: "Processos éticos na Câmara dos Deputados ou Senado Federal" },
] as const;

const THEMATIC_MAIN = [
  { dim: "Educação",      description: "Votações e projetos ligados a educação pública, merenda escolar, FUNDEB e formação docente." },
  { dim: "Saúde",         description: "Posicionamento em relação ao SUS, financiamento de saúde pública e políticas de prevenção." },
  { dim: "Segurança",     description: "Projetos e votações ligados a segurança pública, combate ao crime organizado e políticas de paz." },
  { dim: "Economia",      description: "Posições sobre política fiscal, privatizações, emprego e desenvolvimento econômico sustentável." },
  { dim: "Transparência", description: "Dados abertos, Lei de Acesso à Informação, ficha limpa e ausência de condenações." },
] as const;

const THEMATIC_EXTENDED = [
  { dim: "Meio Ambiente",           description: "Proteção ambiental, desmatamento, energias renováveis e acordos climáticos." },
  { dim: "Infraestrutura",          description: "Transporte, saneamento básico, habitação e mobilidade urbana." },
  { dim: "Tecnologia & Inovação",   description: "Digitalização de serviços públicos, proteção de dados e conectividade." },
  { dim: "Agricultura & Agro",      description: "Política agrícola, crédito rural, agricultura familiar e sustentabilidade no campo." },
  { dim: "Relações Internacionais", description: "Acordos comerciais, diplomacia e cooperação multilateral." },
  { dim: "Cultura & Esporte",       description: "Financiamento à cultura, patrimônio histórico e inclusão pelo esporte." },
  { dim: "Direitos Sociais",        description: "Direitos trabalhistas, inclusão de minorias, acessibilidade e assistência social." },
  { dim: "Empreendedorismo",        description: "Ambiente de negócios, desburocratização e apoio a pequenas empresas." },
] as const;

const DATA_SOURCES = [
  { name: "TSE",            description: "Tribunal Superior Eleitoral — candidaturas, ficha eleitoral, financiamento" },
  { name: "Câmara Federal", description: "Votações, projetos de lei, presença e despesas" },
  { name: "Senado Federal", description: "Votações, projetos de lei e atividade legislativa" },
  { name: "CGU / TCU",      description: "Portal da Transparência — declarações de bens e irregularidades" },
  { name: "STF",            description: "Ações e condenações em instâncias superiores" },
  { name: "MPF / PGR",      description: "Indiciamentos e ações penais públicas" },
] as const;

const NEUTRALITY_ITEMS = [
  "Nenhum candidato, partido ou governo financia ou influencia nossa metodologia",
  "O algoritmo de scoring é open-source e auditável publicamente",
  "Avaliamos apenas dados objetivos e mensuráveis — nenhuma opinião subjetiva",
  "Nossa equipe é multidisciplinar: cientistas de dados, juristas e cientistas políticos",
  "O modelo passa por revisão semestral por pesquisadores externos independentes",
  "Floor de 0.3×: nenhuma alegação isolada pode zerar o score de um político",
] as const;

const LIMITATIONS = [
  "Políticos novos sem histórico legislativo têm avaliação menos precisa",
  "Dados do TSE podem ter atraso de até 24h em períodos eleitorais",
  "Não avaliamos declarações, entrevistas ou posicionamentos em redes sociais",
  "O peso de cada dimensão pode não refletir a prioridade individual do usuário (personalizável no quiz)",
  "Alguns estados têm cobertura de dados mais limitada do que outros",
] as const;

// ─── MetodologiaContent ───────────────────────────────────────────────────────

export function MetodologiaContent() {
  return (
    <div className="flex flex-col gap-12">

      {/* Fórmula */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-foreground">Fórmula do Score</h2>
        <GlassCard accentColor="var(--primary)" className="text-center">
          <p className="font-display text-lg font-bold text-foreground">
            Score Final = (Σ Pilares × 20%) × Multiplicador de Integridade
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cada um dos 5 pilares contribui com 20% do score base (0–10). O multiplicador varia de 0.3 a 1.0.
          </p>
        </GlassCard>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <GlassCard className="text-center">
            <p className="font-semibold text-foreground">5 Pilares</p>
            <p className="mt-1 text-xs text-muted-foreground">20% cada, escala 0–10</p>
          </GlassCard>
          <div className="flex items-center justify-center font-display text-2xl font-bold text-muted-foreground">×</div>
          <GlassCard className="text-center">
            <p className="font-semibold text-foreground">Integridade</p>
            <p className="mt-1 text-xs text-muted-foreground">Multiplicador 0.3–1.0</p>
          </GlassCard>
        </div>
      </section>

      {/* Pilares */}
      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-foreground">5 Pilares — 20% cada</h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Cada pilar tem peso igual de 20%. Esta distribuição igualitária garante imparcialidade — nenhuma área de atuação é privilegiada sobre as demais.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map(({ num, name, weight, icon: Icon, description }) => (
            <GlassCard key={name} className="flex flex-col gap-3 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-primary">{num}</span>
                <span className="text-[11px] font-semibold text-primary">{weight}</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{name}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Ad slot */}
      <AdSlot
        slot="metodologia-leaderboard"
        format="leaderboard"
        note="728 × 90 · leaderboard · metodologia"
      />

      {/* Multiplicador de Integridade */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-foreground">Multiplicador de Integridade</h2>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          Penalidades são cumulativas e reduzem o score base. Nenhuma alegação isolada pode zerar o score — o mínimo é 0.3×. Dados: TSE, STF, TCU e Câmara dos Deputados.
        </p>
        <div className="mb-5 flex flex-col gap-3">
          {PENALTIES.map(({ name, max, desc }) => (
            <GlassCard
              key={name}
              noPadding
              className="flex items-start gap-3 px-4 py-3 border-destructive/20"
            >
              <span className="shrink-0 rounded-lg bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                {max}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <GlassCard className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">1.0× — Limpo</p>
              <p className="text-xs text-muted-foreground">Sem penalidades</p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-foreground">0.7–0.9× — Atenção</p>
              <p className="text-xs text-muted-foreground">Penalidades leves</p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-2">
            <ShieldX className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-foreground">0.3–0.6× — Grave</p>
              <p className="text-xs text-muted-foreground">Penalidades sérias</p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 13 Dimensões Temáticas */}
      <section>
        <h2 className="mb-1 font-display text-xl font-bold text-foreground">13 Dimensões Temáticas</h2>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          As dimensões temáticas compõem o pilar Produtividade (20% do score base). As 5 principais têm peso 2× e as 8 estendidas têm peso 1×.
        </p>

        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Principais — peso 2×
        </p>
        <div className="mb-6 flex flex-col gap-2">
          {THEMATIC_MAIN.map(({ dim, description }) => (
            <GlassCard key={dim} noPadding className="flex gap-4 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-[11px] font-bold text-primary">
                2×
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{dim}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Estendidas — peso 1×
        </p>
        <div className="flex flex-col gap-2">
          {THEMATIC_EXTENDED.map(({ dim, description }) => (
            <GlassCard key={dim} noPadding className="flex gap-4 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-muted text-[11px] font-bold text-muted-foreground">
                1×
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{dim}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Fontes de dados */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-foreground">Fontes de dados</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Todos os dados provêm exclusivamente de fontes governamentais públicas e APIs oficiais.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {DATA_SOURCES.map(({ name, description }) => (
            <GlassCard key={name}>
              <p className="font-display font-bold text-primary">{name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Auditoria externa */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-foreground">Auditoria externa</h2>
        <GlassCard accentColor="var(--primary)">
          <p className="text-sm leading-relaxed text-muted-foreground">
            O Score 2.0 passa por revisão semestral conduzida por pesquisadores externos independentes, incluindo cientistas políticos, economistas e especialistas em dados públicos. Os relatórios de auditoria são publicados nesta página após cada ciclo de revisão.
          </p>
          <p className="mt-3 text-sm font-medium text-foreground">
            Próxima auditoria prevista:{" "}
            <span className="font-semibold text-primary">Dezembro 2026</span>
          </p>
        </GlassCard>
      </section>

      {/* Neutralidade */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-foreground">Neutralidade e imparcialidade</h2>
        <div className="flex flex-col gap-3">
          {NEUTRALITY_ITEMS.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm text-foreground">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Limitações */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-foreground">Limitações conhecidas</h2>
        <GlassCard>
          <ul className="flex flex-col gap-2.5">
            {LIMITATIONS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                {item}
              </li>
            ))}
          </ul>
        </GlassCard>
      </section>
    </div>
  );
}
