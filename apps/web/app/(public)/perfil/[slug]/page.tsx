import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { politiciansService } from "@/lib/api/services";
import { ApiError } from "@/lib/api/client";
import { PoliticianProfileClient } from "@/components/politicians/politician-profile-client";
import { ProfileNav } from "@/components/politicians/profile-nav";
import { OFFICE_LABELS } from "@/lib/content/labels";
import { Routes } from "@/routes";
import { buildMetadata } from "@/lib/seo";

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

    return buildMetadata({
      title,
      description,
      path: Routes.legacyPoliticianProfile(slug),
      type: "profile",
      ...(politician.photoUrl && {
        image: { url: politician.photoUrl, width: 400, height: 400, alt: politician.name },
      }),
    });
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
    <div className="md:w-screen mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <ProfileNav slug={slug} />
      <PoliticianProfileClient slug={slug} />
    </div>
  );
}
