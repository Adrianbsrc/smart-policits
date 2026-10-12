/**
 * Configuração global de SEO. Única fonte da URL base do site — antes
 * duplicada (com o mesmo fallback) em app/layout.tsx, app/robots.ts e
 * app/sitemap.ts.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smartpolitics.com.br";

export const SITE_NAME = "Smart Politics";

export const SITE_LOCALE = "pt_BR";

export const SITE_DEFAULT_TITLE = "Smart Politics — Vote com consciência";

export const SITE_DEFAULT_DESCRIPTION =
  "Plataforma imparcial para ajudar você a decidir seu voto com base em dados públicos, histórico político e alinhamento de valores.";

/** Resolve um path relativo (`/perfis/foo`) para URL absoluta, sem barras duplicadas. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
