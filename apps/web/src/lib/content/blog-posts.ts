export interface BlogPost {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  featured: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "como-funciona-o-financiamento-de-campanhas",
    category: "Análise",
    title: "Como funciona o financiamento de campanhas eleitorais no Brasil",
    excerpt: "Um guia completo sobre as regras de financiamento público e privado de campanhas, fundos eleitorais e o que os dados dizem sobre quem financia quem.",
    date: "24 abr 2026",
    readTime: "8 min",
    featured: true,
  },
  {
    slug: "presenca-nas-votacoes",
    category: "Dados",
    title: "Presença nas votações: quem mais falta ao trabalho no Congresso",
    excerpt: "Analisamos 12 meses de dados de presença na Câmara e no Senado. Os números são surpreendentes — e reveladores.",
    date: "18 abr 2026",
    readTime: "5 min",
    featured: false,
  },
  {
    slug: "quiz-eleitoral-como-usar",
    category: "Guia",
    title: "Como usar o Quiz Eleitoral para tomar decisões mais informadas",
    excerpt: "Um passo a passo de como interpretar seus resultados e comparar candidatos com base no que realmente importa para você.",
    date: "10 abr 2026",
    readTime: "4 min",
    featured: false,
  },
  {
    slug: "transparencia-declaracoes-bens",
    category: "Investigação",
    title: "Declarações de bens: o que dizem os dados do TSE sobre enriquecimento de políticos",
    excerpt: "Cruzamos dados de declarações patrimoniais de deputados federais ao longo de 4 mandatos. Os resultados levantam questões importantes.",
    date: "2 abr 2026",
    readTime: "10 min",
    featured: false,
  },
];

export const CATEGORY_VARIANTS: Record<string, "primary" | "success" | "warning" | "destructive" | "default"> = {
  Análise: "primary",
  Dados: "success",
  Guia: "default",
  Investigação: "warning",
};
