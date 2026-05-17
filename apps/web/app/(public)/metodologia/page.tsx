import type { Metadata } from "next";
import { CheckCircle, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

export const metadata: Metadata = {
  title: "Metodologia | Smart Politics",
  description: "Entenda como o Score 2.0 avalia políticos: 5 pilares estruturais, multiplicador de integridade e 13 dimensões temáticas. Dados públicos e imparciais.",
};

export default function MetodologiaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Transparência</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Metodologia Score 2.0
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Explicamos em detalhes como o Score 2.0 funciona: 5 pilares estruturais, multiplicador de integridade e 13 dimensões temáticas. Dados exclusivamente de fontes governamentais públicas.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {/* Formula overview */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Fórmula do Score</h2>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
            <p className="text-lg font-bold text-foreground">Score Final = Base × Multiplicador de Integridade</p>
            <p className="mt-2 text-sm text-muted-foreground">O multiplicador varia de 0.3 a 1.0 conforme penalidades registradas</p>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Score base", desc: "Soma ponderada dos 5 pilares (0–10)" },
              { label: "×", desc: "" },
              { label: "Multiplicador", desc: "Penalidades por ficha judicial, TCU, etc. (0.3–1.0)" },
            ].map((item, i) => (
              item.desc ? (
                <div key={i} className="rounded-lg border border-border bg-background p-4 text-center">
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ) : (
                <div key={i} className="flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {item.label}
                </div>
              )
            ))}
          </div>
        </section>

        {/* Structural pillars */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">5 Pilares Estruturais</h2>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
            A nota base é a soma ponderada de 5 pilares. O Impacto Temático agrega as 13 dimensões temáticas.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { name: "Transparência", weight: "20%", description: "Publicação de dados, acesso à informação, declarações de bens condizentes e ficha pública limpa." },
              { name: "Atuação", weight: "20%", description: "Taxa de presença em votações, projetos de lei propostos e aprovados, participação em comissões." },
              { name: "Responsabilidade Fiscal", weight: "15%", description: "Gastos de gabinete, cota parlamentar, SIAPE e coerência das despesas declaradas." },
              { name: "Alinhamento CF/88", weight: "15%", description: "Votos alinhados à Constituição Federal de 1988 e ao Estado Democrático de Direito." },
              { name: "Impacto Temático", weight: "30%", description: "Nota consolidada de 13 dimensões temáticas (saúde, educação, meio ambiente, etc.)." },
            ].map(({ name, weight, description }) => (
              <div key={name} className="flex gap-4 rounded-lg border border-border bg-background p-4">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-xs font-bold text-primary">{weight}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Integrity multiplier */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Multiplicador de Integridade</h2>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
            Penalidades são cumulativas e reduzem o score base. Nenhuma alegação isolada pode zerar o score — o mínimo é 0.3×. Dados: TSE, STF, TCU e Câmara dos Deputados.
          </p>
          <div className="mb-5 flex flex-col gap-3">
            {[
              { name: "Condenações criminais", max: "-40%", desc: "Condenações transitadas em julgado em instâncias superiores" },
              { name: "Indiciamentos", max: "-25%", desc: "Indiciamentos por órgãos investigativos como PGR e MPF" },
              { name: "Fichas Sujas (TSE)", max: "-15%", desc: "Registros no banco de fichas sujas do TSE" },
              { name: "Decisões do TCU", max: "-15%", desc: "Irregularidades ou sanções pela Controladoria-Geral da União" },
              { name: "Processo ético", max: "-10%", desc: "Processos éticos na Câmara dos Deputados ou Senado Federal" },
            ].map(({ name, max, desc }) => (
              <div key={name} className="flex items-start gap-3 rounded-lg border border-destructive/10 bg-destructive/5 px-4 py-3">
                <span className="shrink-0 rounded px-2 py-0.5 text-xs font-bold text-destructive">{max}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 dark:bg-green-900/20">
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">1.0× — Limpo</p>
                <p className="text-xs text-green-600/80 dark:text-green-500">Sem penalidades</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-3 dark:bg-yellow-900/20">
              <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">0.7–0.9× — Atenção</p>
                <p className="text-xs text-yellow-600/80 dark:text-yellow-500">Penalidades leves</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 dark:bg-red-900/20">
              <ShieldX className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">0.3–0.6× — Grave</p>
                <p className="text-xs text-red-600/80 dark:text-red-500">Penalidades sérias</p>
              </div>
            </div>
          </div>
        </section>

        {/* Thematic dimensions */}
        <section>
          <h2 className="mb-1 text-xl font-bold text-foreground">13 Dimensões Temáticas</h2>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
            As dimensões temáticas compõem o Impacto Temático (30% da nota base). As 5 principais têm peso 2× e as 8 estendidas têm peso 1×.
          </p>

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Principais — peso 2×
          </h3>
          <div className="mb-4 flex flex-col gap-3">
            {[
              { dim: "Educação", description: "Votações e projetos ligados a educação pública, merenda escolar, FUNDEB e formação docente." },
              { dim: "Saúde", description: "Posicionamento em relação ao SUS, financiamento de saúde pública e políticas de prevenção." },
              { dim: "Segurança", description: "Projetos e votações ligados a segurança pública, combate ao crime organizado e políticas de paz." },
              { dim: "Economia", description: "Posições sobre política fiscal, privatizações, emprego e desenvolvimento econômico sustentável." },
              { dim: "Transparência", description: "Dados abertos, Lei de Acesso à Informação, ficha limpa e ausência de condenações." },
            ].map(({ dim, description }) => (
              <div key={dim} className="flex gap-4 rounded-lg border border-border bg-background p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2×</div>
                <div>
                  <p className="font-semibold text-foreground">{dim}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Estendidas — peso 1×
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { dim: "Meio Ambiente", description: "Proteção ambiental, desmatamento, energias renováveis e acordos climáticos." },
              { dim: "Infraestrutura", description: "Transporte, saneamento básico, habitação e mobilidade urbana." },
              { dim: "Tecnologia & Inovação", description: "Digitalização de serviços públicos, proteção de dados e conectividade." },
              { dim: "Agricultura & Agro", description: "Política agrícola, crédito rural, agricultura familiar e sustentabilidade no campo." },
              { dim: "Relações Internacionais", description: "Acordos comerciais, diplomacia e cooperação multilateral." },
              { dim: "Cultura & Esporte", description: "Financiamento à cultura, patrimônio histórico e inclusão pelo esporte." },
              { dim: "Direitos Sociais", description: "Direitos trabalhistas, inclusão de minorias, acessibilidade e assistência social." },
              { dim: "Empreendedorismo", description: "Ambiente de negócios, desburocratização e apoio a pequenas empresas." },
            ].map(({ dim, description }) => (
              <div key={dim} className="flex gap-4 rounded-lg border border-border bg-background p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/50 text-xs font-bold text-foreground">1×</div>
                <div>
                  <p className="font-semibold text-foreground">{dim}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fontes */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Fontes de dados</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Todos os dados provêm exclusivamente de fontes governamentais públicas e APIs oficiais.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "TSE", description: "Tribunal Superior Eleitoral — candidaturas, ficha eleitoral, financiamento" },
              { name: "Câmara Federal", description: "Votações, projetos de lei, presença e despesas" },
              { name: "Senado Federal", description: "Votações, projetos de lei e atividade legislativa" },
              { name: "CGU / TCU", description: "Portal da Transparência — declarações de bens e irregularidades" },
              { name: "STF", description: "Ações e condenações em instâncias superiores" },
              { name: "MPF / PGR", description: "Indiciamentos e ações penais públicas" },
            ].map(({ name, description }) => (
              <div key={name} className="rounded-lg border border-border bg-background p-4">
                <p className="font-semibold text-primary">{name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Neutralidade */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Neutralidade e imparcialidade</h2>
          <div className="flex flex-col gap-3">
            {[
              "Nenhum candidato, partido ou governo financia ou influencia nossa metodologia",
              "O algoritmo de scoring é open-source e auditável publicamente",
              "Avaliamos apenas dados objetivos e mensuráveis — nenhuma opinião subjetiva",
              "Nossa equipe é multidisciplinar: cientistas de dados, juristas e cientistas políticos",
              "O modelo passa por revisão semestral por pesquisadores externos independentes",
              "Floor de 0.3×: nenhuma alegação isolada pode zerar o score de um político",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Limitações */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Limitações conhecidas</h2>
          <ul className="flex flex-col gap-2">
            {[
              "Políticos novos sem histórico legislativo têm avaliação menos precisa",
              "Dados do TSE podem ter atraso de até 24h em períodos eleitorais",
              "Não avaliamos declarações, entrevistas ou posicionamentos em redes sociais",
              "O peso de cada dimensão pode não refletir a prioridade individual do usuário (personalizável no quiz)",
              "Alguns estados têm cobertura de dados mais limitada do que outros",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
