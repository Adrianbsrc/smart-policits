import { Suspense } from "react";
import type { Metadata } from "next";
import { ColaEleitoralClient } from "@/components/cola-eleitoral/cola-eleitoral-client";

export const metadata: Metadata = {
  title: "Cola Eleitoral | Smart Politics",
  description: "Monte sua lista de candidatos para não esquecer na hora de votar. Compartilhe com amigos e família.",
};

export default function ColaEleitoralPage() {
  return (
    <Suspense>
      <ColaEleitoralClient />
    </Suspense>
  );
}
