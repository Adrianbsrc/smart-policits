import type { MetadataRoute } from "next";
import { candidatesService } from "@/lib/api/services";
import { Routes } from "@/routes";
import { absoluteUrl } from "@/lib/seo";

/**
 * Núcleo do sitemap (docs/SPECs — SEO): Home, Quiz, Ranking, Metodologia.
 * Perfis (`Routes.profile`) entram aqui quando existir uma listagem paginável
 * do domínio PoliticalProfile — hoje só o domínio legado (Politician) tem
 * volume suficiente para valer a pena, via `candidatesService.list` abaixo.
 */
function buildStaticEntries(now: Date): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl(Routes.home()), lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: absoluteUrl(Routes.quiz()), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl(Routes.ranking()), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl(Routes.methodology()), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl(Routes.colaEleitoral()), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl(Routes.blog()), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl(Routes.lgpd()), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl(Routes.privacidade()), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl(Routes.termos()), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let candidatePages: MetadataRoute.Sitemap = [];
  try {
    const result = await candidatesService.list({ limit: 200 });
    candidatePages = result.data.map((c) => ({
      url: absoluteUrl(Routes.legacyPoliticianProfile(c.slug)),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // If API is down during build, skip candidate pages
  }

  return [...buildStaticEntries(now), ...candidatePages];
}
