import { slugify } from "@smart-politics/core";

/**
 * Gera um slug a partir de um texto livre. Reexporta `slugify` do shared
 * kernel (`@smart-politics/core`) — o mesmo algoritmo usado no backend
 * (seeds, ETL, `political-profiles.service.ts`) — para nunca duplicar a lógica.
 */
export function toSlug(value: string): string {
  return slugify(value);
}

/** Um slug é válido se já estiver no formato canônico produzido por `toSlug`. */
export function isValidSlug(candidate: string): boolean {
  return candidate.length > 0 && slugify(candidate) === candidate;
}
