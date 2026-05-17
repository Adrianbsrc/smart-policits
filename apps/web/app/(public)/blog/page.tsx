import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Blog — Smart Politics",
  description: "Análises, dados e insights sobre política brasileira e o cenário eleitoral.",
};

const MOCK_POSTS = [
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
] as const;

const categoryVariants: Record<string, "primary" | "success" | "warning" | "destructive" | "default"> = {
  Análise: "primary",
  Dados: "success",
  Guia: "default",
  Investigação: "warning",
};

export default function BlogPage() {
  const [featured, ...rest] = MOCK_POSTS;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Blog</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Política com dados, não com opinião
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Análises baseadas em fontes públicas. Sem sensacionalismo, sem viés.
        </p>
      </div>

      {/* Featured post */}
      <Link
        href={`/blog/${featured.slug}`}
        className="group mb-10 block overflow-hidden rounded-2xl border border-border bg-background transition-all hover:border-border-strong hover:shadow-lg"
      >
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={categoryVariants[featured.category] ?? "default"}>{featured.category}</Badge>
              <span className="text-xs text-muted-foreground">Destaque</span>
            </div>
            <h2 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
              {featured.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{featured.excerpt}</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {featured.readTime} de leitura
              </span>
              <span className="text-xs text-muted-foreground">{featured.date}</span>
            </div>
          </div>
          <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-xl bg-primary/5 sm:w-40 sm:h-40">
            <span className="text-4xl">📊</span>
          </div>
        </div>
      </Link>

      {/* Post grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-3 rounded-xl border border-border bg-background p-5 transition-all hover:border-border-strong hover:shadow-md"
          >
            <Badge variant={categoryVariants[post.category] ?? "default"} className="w-fit">
              {post.category}
            </Badge>
            <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary leading-snug">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{post.excerpt}</p>
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {post.readTime}
              </span>
              <span className="text-xs text-muted-foreground">{post.date}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
