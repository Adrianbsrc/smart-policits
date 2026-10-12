import type { IndicatorDto, IndicatorValueDto } from "../validations";
import type { IndicatorModel, IndicatorTrend, IndicatorValueModel } from "../models";

/**
 * Mapper DTO → Domain Model (primeira etapa do fluxo obrigatório desta
 * feature). Nunca produz labels/strings de exibição — isso é trabalho do
 * ViewModel Mapper em view-models/.
 */

function mapIndicatorValueDtoToModel(dto: IndicatorValueDto): IndicatorValueModel {
  return {
    period: dto.period,
    value: dto.value,
    variation: dto.variation,
    notes: dto.notes,
  };
}

function resolveCurrentValue(values: IndicatorValueModel[]): IndicatorValueModel | null {
  if (values.length === 0) return null;
  return values[values.length - 1] ?? null;
}

function resolveTrend(currentValue: IndicatorValueModel | null): IndicatorTrend {
  if (!currentValue || currentValue.variation === null) return "unknown";
  if (currentValue.variation > 0) return "up";
  if (currentValue.variation < 0) return "down";
  return "stable";
}

export function mapIndicatorDtoToModel(dto: IndicatorDto): IndicatorModel {
  const values = dto.values.map(mapIndicatorValueDtoToModel);
  const currentValue = resolveCurrentValue(values);

  return {
    id: dto.id,
    name: dto.name,
    category: dto.category,
    description: dto.description,
    unit: dto.unit,
    values,
    currentValue,
    trend: resolveTrend(currentValue),
    source: { name: dto.source.name, url: dto.source.url },
  };
}
