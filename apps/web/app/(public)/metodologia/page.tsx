import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Metodologia",
  description: "Entenda como calculamos as notas dos candidatos, nossas fontes de dados e como garantimos imparcialidade.",
};

export default function MetodologiaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Transparência</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Nossa Metodologia
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Explicamos em detalhes como funcionam nossos algoritmos, quais dados usamos e como garantimos que nenhum candidato, partido ou governo influencia nossos resultados.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        <Section title="Fontes de dados">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Todos os dados utilizados na plataforma são provenientes exclusivamente de fontes governamentais públicas e APIs oficiais. Não utilizamos dados de fontes privadas, partidos políticos ou meios de comunicação.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { name: "TSE", description: "Tribunal Superior Eleitoral — dados de candidaturas, financiamento, ficha eleitoral" },
              { name: "Câmara Federal", description: "Votações, projetos de lei, presença e despesas" },
              { name: "Senado Federal", description: "Votações, projetos de lei e atividade legislativa" },
              { name: "CGU", description: "Portal da Transparência — declarações de bens e benefícios" },
            ].map(({ name, description }) => (
              <div key={name} className="rounded-lg border border-border bg-background p-4">
                <p className="font-semibold text-primary">{name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Como calculamos o score">
          <p className="text-sm leading-relaxed text-muted-foreground">
            O score de cada candidato é calculado com base em 13 dimensões divididas em dois grupos. As 5 dimensões principais têm peso 2× e as 8 dimensões estendidas têm peso 1×, totalizando um denominador de 18 pontos. O score final varia de 0 a 10.
          </p>

          <h3 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Dimensões principais — peso 2×
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { dim: "Educação", weight: "2×", description: "Votações e projetos ligados a educação pública, merenda escolar, FUNDEB e formação docente." },
              { dim: "Saúde", weight: "2×", description: "Posicionamento em relação ao SUS, financiamento de saúde pública e políticas de prevenção." },
              { dim: "Segurança", weight: "2×", description: "Projetos e votações ligados a segurança pública, combate ao crime organizado e políticas de paz." },
              { dim: "Economia", weight: "2×", description: "Posições sobre política fiscal, privatizações, emprego e desenvolvimento econômico sustentável." },
              { dim: "Transparência", weight: "2×", description: "Ficha eleitoral limpa, declarações de bens condizentes, presença em votações e ausência de condenações." },
            ].map(({ dim, weight, description }) => (
              <div key={dim} className="flex gap-4 rounded-lg border border-border bg-background p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {weight}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{dim}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Dimensões estendidas — peso 1×
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { dim: "Meio Ambiente", description: "Votações sobre proteção ambiental, desmatamento, energias renováveis e acordos climáticos." },
              { dim: "Infraestrutura", description: "Investimentos em transporte, saneamento básico, habitação e obras de mobilidade urbana." },
              { dim: "Tecnologia & Inovação", description: "Apoio a startups, digitalização de serviços públicos, proteção de dados e conectividade." },
              { dim: "Agricultura & Agro", description: "Política agrícola, crédito rural, agricultura familiar e sustentabilidade no campo." },
              { dim: "Relações Internacionais", description: "Acordos comerciais, diplomacia, cooperação multilateral e defesa da soberania nacional." },
              { dim: "Cultura & Esporte", description: "Financiamento à cultura, patrimônio histórico, esporte de base e inclusão pelo esporte." },
              { dim: "Direitos Sociais", description: "Direitos trabalhistas, inclusão de minorias, acessibilidade e políticas de assistência social." },
              { dim: "Empreendedorismo", description: "Ambiente de negócios, desburocratização, microcrédito e apoio a pequenas empresas." },
            ].map(({ dim, description }) => (
              <div key={dim} className="flex gap-4 rounded-lg border border-border bg-background p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/50 text-xs font-bold text-foreground">
                  1×
                </div>
                <div>
                  <p className="font-semibold text-foreground">{dim}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Neutralidade e imparcialidade">
          <div className="flex flex-col gap-3">
            {[
              "Nenhum candidato, partido ou governo financia ou influencia nossa metodologia",
              "O algoritmo de scoring é open-source e auditável publicamente no GitHub",
              "Avaliamos apenas dados objetivos e mensuráveis — nenhuma opinião subjetiva",
              "Nossa equipe é multidisciplinar e inclui cientistas de dados, juristas e cientistas políticos",
              "O modelo passa por revisão semestral por pesquisadores externos independentes",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Limitações">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Reconhecemos que nenhum sistema de avaliação é perfeito. Nossas principais limitações incluem:
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {[
              "Candidatos novos sem histórico legislativo têm avaliação menos precisa",
              "Dados do TSE podem ter atraso de atualização de até 24h em períodos eleitorais",
              "Não avaliamos declarações, entrevistas ou posicionamentos em redes sociais",
              "O peso de cada dimensão pode não refletir a prioridade individual do usuário (personalizável no quiz)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* <div className="rounded-xl border border-border bg-background-subtle p-6">
          <p className="text-sm font-semibold text-foreground">Quer colaborar?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Nosso código é open-source. Sugestões, correções e pull requests são bem-vindos.
          </p>
          <a
            href="https://github.com/smart-politics"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
          >
            Ver no GitHub
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div> */}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-foreground">{title}</h2>
      {children}
    </div>
  );
}
