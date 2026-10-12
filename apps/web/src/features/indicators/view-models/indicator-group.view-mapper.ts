import type { IndicatorCategory } from "../models";
import { INDICATOR_CATEGORY_LABELS } from "./indicator.view-mapper";
import type { IndicatorViewModel } from "./indicator.view-model";
import type { IndicatorCategoryGroupViewModel } from "./indicator-group.view-model";

/** docs/SPECs/indicators.md — ordem de exibição das categorias. */
const CATEGORY_ORDER: IndicatorCategory[] = [
  "economy",
  "education",
  "health",
  "security",
  "infrastructure",
  "environment",
];

function buildSummary(indicators: IndicatorViewModel[]): string {
  const total = indicators.length;
  const up = indicators.filter((indicator) => indicator.trendVariant === "success").length;
  const down = indicators.filter((indicator) => indicator.trendVariant === "destructive").length;

  const parts = [`${total} ${total === 1 ? "indicador" : "indicadores"}`];
  if (up > 0) parts.push(`${up} em alta`);
  if (down > 0) parts.push(`${down} em queda`);
  return parts.join(" · ");
}

/** Agrupa por categoria na ordem da SPEC. Grupos sem indicadores não aparecem. */
export function groupIndicatorsByCategory(indicators: IndicatorViewModel[]): IndicatorCategoryGroupViewModel[] {
  const groups = new Map<string, IndicatorViewModel[]>();

  for (const indicator of indicators) {
    const bucket = groups.get(indicator.categoryLabel);
    if (bucket) bucket.push(indicator);
    else groups.set(indicator.categoryLabel, [indicator]);
  }

  return CATEGORY_ORDER.map((category) => INDICATOR_CATEGORY_LABELS[category])
    .filter((categoryLabel) => groups.has(categoryLabel))
    .map((categoryLabel) => {
      const categoryIndicators = groups.get(categoryLabel) ?? [];
      return { categoryLabel, summary: buildSummary(categoryIndicators), indicators: categoryIndicators };
    });
}
