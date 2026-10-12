import { permanentRedirect } from "next/navigation";
import { Routes } from "@/routes";

type Props = { params: Promise<{ slug: string }> };

export default async function CandidatoLegacyRedirect({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(Routes.legacyPoliticianProfile(slug));
}
