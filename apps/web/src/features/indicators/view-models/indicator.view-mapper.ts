import type { IndicatorCategory, IndicatorModel, IndicatorTrend, IndicatorValueModel } from "../models";
import type { IndicatorValueViewModel, IndicatorViewModel, TrendVariant } from "./indicator.view-model";

/**
 * ViewModel Mapper — segunda etapa do fluxo obrigatório (Domain Model →
 * View Model). Único lugar onde category/trend viram texto/cor de exibição.
 * Importa apenas de models/ (Domain) e do próprio view-models/ — nunca de
 * validations/ ou api/.
 */

export const INDICATOR_CATEGORY_LABELS: Record<IndicatorCategory, string> = {
  economy: "Economia",
  education: "Educação",
  health: "Saúde",
  security: "Segurança",
  infrastructure: "Infraestrutura",
  environment: "Meio Ambiente",
};

const TREND_LABELS: Record<IndicatorTrend, string> = {
  up: "Em alta",
  down: "Em queda",
  stable: "Estável",
  unknown: "Sem tendência",
};

const TREND_VARIANTS: Record<IndicatorTrend, TrendVariant> = {
  up: "success",
  down: "destructive",
  stable: "default",
  unknown: "outline",
};

function formatValue(value: number, unit: string): string {
  const formatted = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
  return `${formatted} ${unit}`;
}

function formatVariation(variation: number | null): string | null {
  if (variation === null) return null;
  const sign = variation > 0 ? "+" : "";
  return `${sign}${variation}%`;
}

function mapIndicatorValueModelToViewModel(value: IndicatorValueModel, unit: string): IndicatorValueViewModel {
  return {
    periodLabel: value.period,
    formattedValue: formatValue(value.value, unit),
    variationLabel: formatVariation(value.variation),
    notes: value.notes,
  };
}

export function mapIndicatorModelToViewModel(model: IndicatorModel): IndicatorViewModel {
  return {
    id: model.id,
    name: model.name,
    categoryLabel: INDICATOR_CATEGORY_LABELS[model.category],
    description: model.description,
    unit: model.unit,
    currentValueLabel: model.currentValue ? formatValue(model.currentValue.value, model.unit) : "Sem dados",
    trendLabel: TREND_LABELS[model.trend],
    trendVariant: TREND_VARIANTS[model.trend],
    values: model.values.map((value) => mapIndicatorValueModelToViewModel(value, model.unit)),
    sourceLabel: model.source.name,
  };
}
