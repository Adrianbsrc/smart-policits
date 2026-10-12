import type { Metadata } from "next";
import { EvidenceListDebug } from "@/features/evidence";
import { Routes } from "@/routes";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  return buildMetadata({
    title: `Evidence debug — ${slug}`,
    description: "Ferramenta interna de debug da feature Evidence.",
    path: Routes.evidenceDebug(slug),
    robots: { index: false, follow: false },
  });
}

/** Tela de debug — sem layout elaborado, apenas valida o fluxo da feature Evidence. */
export default async function EvidenceDebugPage({ params }: Props) {
  const { slug } = await params;
  return <EvidenceListDebug slug={slug} />;
}
