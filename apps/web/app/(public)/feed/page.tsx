import type { Metadata } from "next";
import { Rss } from "lucide-react";
import { FeedList } from "@/components/feed/feed-list";

export const metadata: Metadata = {
  title: "Feed de Destaques | Smart Politics",
  description: "Acompanhe os destaques políticos, votações e notícias em tempo real. Perfis, scores e análises dos políticos brasileiros.",
  openGraph: {
    title: "Feed de Destaques | Smart Politics",
    description: "Destaques políticos, votações e análises dos políticos brasileiros.",
    type: "website",
  },
  alternates: { canonical: "/feed" },
};

export default function FeedPage() {
  return (
    <div className="relative">
      {/* Background gradient — the "canvas" that glass cards blur against */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 0% 0%, oklch(0.35 0.17 264 / 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 100% 100%, oklch(0.50 0.18 290 / 0.10) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 50%, oklch(0.40 0.15 240 / 0.06) 0%, transparent 70%)
          `,
        }}
      />

      {/* Header — hidden on mobile (snap-scroll takes full height), visible on desktop */}
      <div className="mx-auto hidden max-w-7xl px-4 pb-6 pt-12 sm:block sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Rss className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Feed de Destaques
            </h1>
            <p className="text-sm text-muted-foreground">
              Perfis, votações e notícias políticas atualizadas
            </p>
          </div>
        </div>
      </div>

      {/* Feed — no padding on mobile so cards can go full-screen */}
      <div className="sm:mx-auto sm:max-w-7xl sm:px-4 sm:pb-16 sm:pt-0 lg:px-8">
        <FeedList />
      </div>
    </div>
  );
}
