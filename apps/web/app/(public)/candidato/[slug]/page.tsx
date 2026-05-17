import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { candidatesService } from "@/lib/api/services";
import { ApiError } from "@/lib/api/client";
import { CandidateProfileClient } from "@/components/candidates/candidate-profile-client";
import { OFFICE_LABELS } from "@/lib/content/labels";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const candidate = await candidatesService.detail(slug);
    const officeName = OFFICE_LABELS[candidate.office] ?? candidate.office;
    const score = candidate.score?.overall;
    const partyName = candidate.party?.acronym ?? "";

    const title = `${candidate.name} (${partyName}) | Smart Politics`;
    const description = `Perfil de ${candidate.name} — ${officeName}${candidate.state ? ` por ${candidate.state}` : ""}.${score ? ` Nota geral: ${score.toFixed(1)}/10.` : ""} Veja histórico, scores e transparência.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
        ...(candidate.photoUrl && { images: [{ url: candidate.photoUrl, width: 400, height: 400, alt: candidate.name }] }),
      },
      twitter: {
        card: "summary",
        title,
        description,
        ...(candidate.photoUrl && { images: [candidate.photoUrl] }),
      },
      alternates: {
        canonical: `/candidato/${slug}`,
      },
    };
  } catch {
    return {
      title: "Candidato não encontrado | Smart Politics",
      description: "O perfil deste candidato não foi encontrado.",
    };
  }
}

export default async function CandidatoPage({ params }: Props) {
  const { slug } = await params;

  try {
    await candidatesService.detail(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    // Other errors (network, server): let client component handle gracefully
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/ranking"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao ranking
        </Link>
        <Link
          href={`/comparar?a=${slug}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Comparar candidatos
        </Link>
      </div>

      <CandidateProfileClient slug={slug} />
    </div>
  );
}
