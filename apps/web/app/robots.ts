import type { MetadataRoute } from "next";
import { Routes } from "@/routes";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/debug/",
          Routes.dashboard(),
          Routes.favoritos(),
          Routes.configuracoes(),
          Routes.quizResult(),
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
