import type { Metadata } from "next";
import { FeedPageClient } from "@/components/feed/feed-page-client";

export const metadata: Metadata = {
  title: "Feed de Destaques | Smart Politics",
  description: "Acompanhe os destaques políticos, votações e notícias. Perfis, scores e análises dos políticos brasileiros.",
  openGraph: {
    title: "Feed de Destaques | Smart Politics",
    description: "Destaques políticos, votações e análises dos políticos brasileiros.",
    type: "website",
  },
  alternates: { canonical: "/feed" },
};

export default function FeedPage() {
  return <FeedPageClient />;
}
