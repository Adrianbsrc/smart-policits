import type { Metadata } from "next";
import { SITE_NAME, absoluteUrl } from "./site-config";

export type PageOpenGraphType = "website" | "profile" | "article";

export interface PageMetadataImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface PageMetadataInput {
  title: string;
  description: string;
  /** Path relativo da página (ex.: Routes.profile(slug)) — vira canonical e og:url. */
  path: string;
  image?: PageMetadataImage;
  type?: PageOpenGraphType;
  /** Omitido por padrão para herdar o `robots` do layout raiz (ver docs Next.js — Metadata Merging). */
  robots?: { index: boolean; follow: boolean };
}

function toAbsoluteImageUrl(url: string): string {
  return url.startsWith("http") ? url : absoluteUrl(url);
}

/**
 * Compositor único de Metadata (title/description/OG/Twitter/canonical/robots)
 * para páginas do App Router. Centraliza o que hoje está duplicado
 * manualmente em cada `generateMetadata` (ver docs/SPECs — SEO).
 */
export function buildMetadata(input: PageMetadataInput): Metadata {
  const { title, description, path, image, type = "website", robots } = input;
  const url = absoluteUrl(path);
  const ogImage = image
    ? [{ url: toAbsoluteImageUrl(image.url), width: image.width, height: image.height, alt: image.alt ?? title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      type,
      url,
      siteName: SITE_NAME,
      ...(ogImage && { images: ogImage }),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage && { images: ogImage.map((i) => i.url) }),
    },
    ...(robots && {
      robots: {
        index: robots.index,
        follow: robots.follow,
        googleBot: { index: robots.index, follow: robots.follow },
      },
    }),
  };
}
