import type { Metadata } from "next";
import { RankingClient } from "@/components/politicians/ranking-client";

export const metadata: Metadata = {
  title: "Ranking de Políticos",
  description:
    "Ranking dos candidatos brasileiros com melhor avaliação, baseado em dados públicos, histórico político, transparência e atuação legislativa. Filtre por cargo, estado e partido.",
  openGraph: {
    title: "Ranking de Políticos | Smart Politics",
    description:
      "Compare candidatos por educação, saúde, segurança, economia e transparência. Dados do TSE e fontes oficiais.",
    type: "website",
    url: "/ranking",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ranking de Políticos | Smart Politics",
    description:
      "Compare candidatos por educação, saúde, segurança, economia e transparência. Dados do TSE e fontes oficiais.",
  },
  alternates: {
    canonical: "/ranking",
  },
};

export default function RankingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ranking de Políticos
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Avaliados com base em dados públicos, histórico de votações e transparência. Filtre por cargo, estado e partido.
        </p>
      </div>

      <RankingClient />
    </div>
  );
}
