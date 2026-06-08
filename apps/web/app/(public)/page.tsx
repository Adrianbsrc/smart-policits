import type { Metadata } from "next";
import { CTABanner } from "@/components/cta/cta-banner";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { RankingPreviewSection } from "@/components/landing/ranking-preview-section";
import { TransparencySection } from "@/components/landing/transparency-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "Vote com consciência — Smart Politics",
  description:
    "Plataforma imparcial para ajudar você a decidir seu voto com base em dados públicos, histórico político e alinhamento de valores.",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <StatsSection />
      <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
        <CTABanner
          featureKey="SHORTS_FEED"
          title="Novo: Feed de Destaques Políticos"
          description="Acompanhe os principais políticos, votações e novidades em tempo real. Um feed personalizado com análises e scores atualizados."
          ctaLabel="Explorar Feed"
          ctaHref="/feed"
        />
      </div>
      <HowItWorksSection />
      <BenefitsSection />
      <RankingPreviewSection />
      <TransparencySection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}
