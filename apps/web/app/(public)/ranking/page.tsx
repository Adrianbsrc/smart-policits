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
  alternates: { canonical: "/ranking" },
};

export default function RankingPage() {
  return <RankingClient />;
}
