import type { MetadataRoute } from "next";
import { candidatesService } from "@/lib/api/services";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smartpolitics.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/quiz`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/ranking`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/cola-eleitoral`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/metodologia`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/lgpd`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/termos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  let candidatePages: MetadataRoute.Sitemap = [];
  try {
    const result = await candidatesService.list({ limit: 200 });
    candidatePages = result.data.map((c) => ({
      url: `${BASE_URL}/candidato/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // If API is down during build, skip candidate pages
  }

  return [...staticPages, ...candidatePages];
}
