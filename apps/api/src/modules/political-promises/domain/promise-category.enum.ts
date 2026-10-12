/** Categorias de promessa — docs/SPECs/promise.md. */
export const PROMISE_CATEGORIES = [
  "economy",
  "education",
  "health",
  "security",
  "infrastructure",
  "environment",
  "technology",
  "foreign_relations",
  "human_rights",
  "public_management",
  "administrative_reform",
  "tax_reform",
  "other",
] as const;

export type PromiseCategory = (typeof PROMISE_CATEGORIES)[number];
