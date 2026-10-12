import type { Indicator, IndicatorValue } from "./domain/indicator.entity";
import type { IndicatorResponseDto, IndicatorValueDto } from "./dto/indicator-response.dto";

function toIndicatorValueDto(value: IndicatorValue): IndicatorValueDto {
  return {
    period: value.period,
    value: value.value,
    variation: value.variation,
    notes: value.notes,
  };
}

function toIndicatorDto(indicator: Indicator): IndicatorResponseDto {
  return {
    id: indicator.id,
    name: indicator.name,
    category: indicator.category,
    description: indicator.description,
    unit: indicator.unit,
    values: indicator.values.map(toIndicatorValueDto),
    source: indicator.source,
  };
}

export function toIndicatorDtos(indicators: Indicator[]): IndicatorResponseDto[] {
  return indicators.map(toIndicatorDto);
}
