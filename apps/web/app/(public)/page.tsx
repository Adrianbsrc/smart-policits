import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildFaqPageJsonLd, buildMetadata, SITE_DEFAULT_DESCRIPTION } from "@/lib/seo";
import { Routes } from "@/routes";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TrustSection } from "@/components/landing/trust-section";
import { SearchSection } from "@/components/landing/search-section";
import { RankingPreviewSection } from "@/components/landing/ranking-preview-section";
import { FaqSection, FAQ_ITEMS } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { LazyAdSlot } from "@/components/landing/lazy-ad-slot";

/**
 * Título sem o sufixo "Smart Politics" — o `title.template` do layout raiz
 * já adiciona (ver app/layout.tsx); repeti-lo aqui duplicaria o sufixo na
 * aba do navegador. O `openGraph.title` gerado por `buildMetadata` usa este
 * texto puro, com `siteName` carregando a marca separadamente.
 */
/** ISR: a Home fica estática (rápida) mas revalida de hora em hora — sem isso, HeroMetrics ficaria congelado no valor do build. */
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Vote com clareza",
  description: SITE_DEFAULT_DESCRIPTION,
  path: Routes.home(),
  type: "website",
});

/**
 * Home (docs/SPECs/home.md). Ordem das seções, anúncios e cada decisão de
 * estrutura estão documentados na SPEC — esta página só compõe.
 *
 * Anúncios (`LazyAdSlot`) usam `next/dynamic` com `ssr: false` para adiar o
 * JS deles para depois da renderização inicial (ver SPEC#performance); a
 * arquitetura do `AdSlot` em si (`components/ui/ad-slot.tsx`) não muda.
 * Nenhum anúncio aparece antes de "Por que confiar" — a prova de
 * credibilidade vem antes de qualquer monetização.
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <JsonLdScript data={buildFaqPageJsonLd(FAQ_ITEMS)} />

      <HeroSection />
      <HowItWorksSection />
      <TrustSection />

      <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
        <LazyAdSlot slot="home-billboard" format="billboard" note="970 × 250 · após a prova de confiança" />
      </div>

      <SearchSection />
      <RankingPreviewSection />

      <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
        <LazyAdSlot slot="home-leaderboard" format="leaderboard" note="728 × 90 · após o ranking" />
      </div>

      <FaqSection />
      <CtaSection />

      <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
        <LazyAdSlot slot="home-rectangle" format="rectangle" note="300 × 250 · fim de página · tráfego mais engajado" />
      </div>
    </div>
  );
}
