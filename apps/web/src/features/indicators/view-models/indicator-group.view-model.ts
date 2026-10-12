import type { IndicatorViewModel } from "./indicator.view-model";

export interface IndicatorCategoryGroupViewModel {
  categoryLabel: string;
  /** Ex: "4 indicadores · 2 em alta · 1 em queda". */
  summary: string;
  indicators: IndicatorViewModel[];
}
