import type { Source } from "@smart-politics/core";
import type { IndicatorCategoryDto } from "../validations";

/**
 * Domain Model — representação de domínio pura. NUNCA conhece a UI: sem
 * labels, sem cores, sem strings formatadas para exibição (isso é
 * responsabilidade do View Model, ver view-models/).
 *
 * O vocabulário de categoria é compartilhado com o DTO (o valor em si não
 * muda) — reaproveitar o tipo aqui evita duplicar a lista de literais.
 */
export type IndicatorCategory = IndicatorCategoryDto;

/** Tendência é um fato objetivo derivado dos dados (sinal da variação), não uma decisão visual. */
export type IndicatorTrend = "up" | "down" | "stable" | "unknown";

export interface IndicatorValueModel {
  period: string;
  value: number;
  variation: number | null;
  notes: string | null;
}

export interface IndicatorModel {
  id: string;
  name: string;
  category: IndicatorCategory;
  description: string;
  unit: string;
  values: IndicatorValueModel[];
  /** Último valor da série (ou null se não houver nenhum). */
  currentValue: IndicatorValueModel | null;
  trend: IndicatorTrend;
  source: Source;
}
