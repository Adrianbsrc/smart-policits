import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { Routes } from "@/routes";
import { absoluteUrl, buildMetadata, buildPersonJsonLd } from "@/lib/seo";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  Assessment,
  HeroSection,
  Mandates,
  OfficialData,
  QuickFacts,
  getExecutiveSummaryQuery,
  getMandatesQuery,
} from "@/features/political-profile";
import type { ExecutiveSummaryViewModel } from "@/features/political-profile";
import { Timeline } from "@/features/timeline";
import { Promises } from "@/features/promises";
import { Indicators } from "@/features/indicators";
import { Integrity } from "@/features/integrity";

type Props = { params: Promise<{ slug: string }> };

/** Cargo + partido dão contexto extra à bio (ou substituem um texto genérico quando ela não existe). */
function buildOgDescription(summary: ExecutiveSummaryViewModel): string {
  const context = [summary.currentOfficeLabel, summary.currentPartyLabel].filter((part): part is string => Boolean(part));

  if (summary.shortBiography) {
    return context.length > 0 ? `${summary.shortBiography} — ${context.join(" · ")}.` : summary.shortBiography;
  }
  if (context.length > 0) {
    return `${summary.displayName} — ${context.join(" · ")}. Veja resumo, linha do tempo e mandatos no Smart Politics.`;
  }
  return `Perfil político de ${summary.displayName} no Smart Politics.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const summary = await getExecutiveSummaryQuery.execute(slug);
    const title = summary.currentOfficeLabel
      ? `${summary.displayName} — ${summary.currentOfficeLabel}`
      : summary.displayName;
    const description = buildOgDescription(summary);

    return buildMetadata({
      title,
      description,
      path: Routes.profile(slug),
      type: "profile",
      ...(summary.photoUrl && {
        image: { url: summary.photoUrl, width: 400, height: 400, alt: summary.displayName },
      }),
    });
  } catch {
    return {
      title: "Perfil não encontrado",
      description: "O perfil político solicitado não foi encontrado.",
    };
  }
}

/**
 * Página estrutural do perfil político (App Router, Server Component).
 * Cada bloco é um componente independente; só Assessment continua
 * placeholder (depende do Evidence Engine) — fora do escopo desta task (ver
 * docs/SPECs/political-profile.md).
 *
 * HeroSection (identificação) + QuickFacts (cards resumidos), Timeline
 * ("Linha do tempo política"), Mandates, Dados Oficiais, Promises, Indicators
 * e Integrity têm dados reais, construídos só a partir de
 * filiações/eleições/mandatos já persistidos — nenhum usa Evidence ainda.
 * ShareButton (dentro de HeroSection) só copia a URL atual, sem nenhuma nova
 * fonte de dados. Timeline, Promises, Indicators e
 * Integrity são features próprias (features/timeline, features/promises,
 * features/indicators, features/integrity) — a página só repassa `slug`;
 * toda a busca, agrupamento e expand/collapse acontecem dentro do
 * componente (Client Component, já que exige interatividade). Nenhuma
 * lógica de negócio acontece aqui — a página só chama os Query Objects e
 * repassa o resultado.
 *
 * summary e mandates são buscados em paralelo (Promise.allSettled): mandates
 * não depende do resultado de summary, então não há motivo para aguardar um
 * antes do outro — isso reduz o tempo de renderização no servidor.
 */
export default async function PoliticalProfilePage({ params }: Props) {
  const { slug } = await params;

  const [summaryResult, mandatesResult] = await Promise.allSettled([
    getExecutiveSummaryQuery.execute(slug),
    getMandatesQuery.execute(slug),
  ]);

  if (summaryResult.status === "rejected") {
    const err = summaryResult.reason;
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const summary = summaryResult.value;
  const mandates = mandatesResult.status === "fulfilled" ? mandatesResult.value : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <JsonLdScript
        data={buildPersonJsonLd({
          name: summary.fullName,
          path: Routes.profile(slug),
          ...(summary.shortBiography && { description: summary.shortBiography }),
          ...(summary.photoUrl && { image: summary.photoUrl }),
          ...(summary.currentOfficeLabel && { jobTitle: summary.currentOfficeLabel }),
          ...(summary.currentPartyLabel && { affiliation: summary.currentPartyLabel }),
        })}
      />
      <div className="flex flex-col gap-8">
        <HeroSection summary={summary} shareUrl={absoluteUrl(Routes.profile(slug))} />
        <QuickFacts summary={summary} />
        <Assessment />
        <Timeline slug={slug} title="Linha do tempo política" />
        <Mandates mandates={mandates} />
        <Promises slug={slug} />
        <Indicators slug={slug} />
        <Integrity slug={slug} />
        <OfficialData lastUpdatedLabel={summary.lastUpdatedLabel} />
      </div>
    </div>
  );
}
