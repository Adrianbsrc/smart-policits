/**
 * View Model — forma pronta para exibição. NUNCA conhece a API/DTO: só
 * importa tipos de models/ (Domain) e de si mesma. Componentes só
 * conhecem View Models, nunca Domain Models nem DTOs.
 */

export type TrendVariant = "success" | "destructive" | "default" | "outline";

export interface IndicatorValueViewModel {
  periodLabel: string;
  formattedValue: string;
  variationLabel: string | null;
  notes: string | null;
}

export interface IndicatorViewModel {
  id: string;
  name: string;
  categoryLabel: string;
  description: string;
  unit: string;
  currentValueLabel: string;
  trendLabel: string;
  trendVariant: TrendVariant;
  /** Pontos já formatados, prontos para uma futura série histórica/gráfico. */
  values: IndicatorValueViewModel[];
  sourceLabel: string;
}
