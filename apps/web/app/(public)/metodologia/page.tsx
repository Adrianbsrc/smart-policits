import type { Metadata } from "next";
import { MetodologiaContent } from "@/components/metodologia/metodologia-content";

export const metadata: Metadata = {
  title: "Metodologia | Smart Politics",
  description:
    "Entenda como o Score 2.0 avalia políticos: 5 pilares com peso igual de 20%, multiplicador de integridade e 13 dimensões temáticas. Dados públicos e imparciais.",
};

export default function MetodologiaPage() {
  return (
    <div className="relative min-h-screen">
      <div className="page-gradient pointer-events-none fixed inset-0 -z-10 opacity-60" aria-hidden />

      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Transparência
            </p>
            <h1 className="mt-2 font-display text-[2.5rem] font-bold leading-tight tracking-tight text-foreground">
              Metodologia Score 2.0
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Explicamos em detalhes como o Score 2.0 funciona: 5 pilares com peso igual de 20%
              cada, multiplicador de integridade e 13 dimensões temáticas. Dados exclusivamente de
              fontes governamentais públicas.
            </p>
          </div>
          <MetodologiaContent />
        </div>
      </div>
    </div>
  );
}
