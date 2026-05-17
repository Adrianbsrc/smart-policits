import type { Metadata } from "next";
import { Suspense } from "react";
import { CandidateComparisonClient } from "@/components/candidates/candidate-comparison-client";

export const metadata: Metadata = {
  title: "Comparar Políticos",
  description: "Compare scores e dimensões de até 4 políticos lado a lado. Veja qual se alinha mais com seus valores.",
  openGraph: {
    title: "Comparar Políticos — Smart Politics",
    description: "Compare até 4 políticos lado a lado com base em dados públicos e scores por dimensão.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Comparar Políticos — Smart Politics",
    description: "Compare até 4 políticos lado a lado.",
  },
};

export default function CompararPage() {
  return (
    <Suspense fallback={null}>
      <CandidateComparisonClient />
    </Suspense>
  );
}
