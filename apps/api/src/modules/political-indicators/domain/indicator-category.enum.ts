/** Categorias de indicador — docs/SPECs/indicators.md. */
export const INDICATOR_CATEGORIES = [
  "economy",
  "education",
  "health",
  "security",
  "infrastructure",
  "environment",
] as const;

export type IndicatorCategory = (typeof INDICATOR_CATEGORIES)[number];
