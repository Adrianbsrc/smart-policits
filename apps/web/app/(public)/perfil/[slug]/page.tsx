import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, GitCompare } from "lucide-react";
import { notFound } from "next/navigation";
import { politiciansService } from "@/lib/api/services";
import { ApiError } from "@/lib/api/client";
import { PoliticianProfileClient } from "@/components/politicians/politician-profile-client";
import { OFFICE_LABELS } from "@/lib/content/labels";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const politician = await politiciansService.detail(slug);
    const officeName = OFFICE_LABELS[politician.office] ?? politician.office;
    const score = politician.score?.overall;
    const partyName = politician.party?.acronym ?? "";

    const title = `${politician.name} (${partyName}) | Smart Politics`;
    const description = `Perfil de ${politician.name} — ${officeName}${politician.state ? ` por ${politician.state}` : ""}.${score ? ` Nota geral: ${score.toFixed(1)}/10.` : ""} Veja histórico, scores e transparência.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
        ...(politician.photoUrl && { images: [{ url: politician.photoUrl, width: 400, height: 400, alt: politician.name }] }),
      },
      twitter: {
        card: "summary",
        title,
        description,
        ...(politician.photoUrl && { images: [politician.photoUrl] }),
      },
      alternates: {
        canonical: `/perfil/${slug}`,
      },
    };
  } catch {
    return {
      title: "Político não encontrado | Smart Politics",
      description: "O perfil deste político não foi encontrado.",
    };
  }
}

export default async function PerfilPage({ params }: Props) {
  const { slug } = await params;

  try {
    await politiciansService.detail(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/ranking"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao ranking
        </Link>
        <Link
          href={`/comparar?a=${slug}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <GitCompare className="h-3.5 w-3.5" />
          Comparar perfis
        </Link>
      </div>

      <PoliticianProfileClient slug={slug} />
    </div>
  );
}
