import type { Query } from "@/lib/queries";
import { indicatorsApi } from "../api";
import { mapIndicatorDtoToModel } from "../mappers";
import { mapIndicatorModelToViewModel } from "../view-models";
import type { IndicatorViewModel } from "../view-models";

/** Encapsula o fluxo completo (API → DTO → Mapper → Domain Model → ViewModel) atrás de execute(slug). */
export class GetIndicatorsQuery implements Query<string, IndicatorViewModel[]> {
  async execute(slug: string): Promise<IndicatorViewModel[]> {
    const dtos = await indicatorsApi.getIndicators(slug);
    return dtos.map(mapIndicatorDtoToModel).map(mapIndicatorModelToViewModel);
  }
}

export const getIndicatorsQuery = new GetIndicatorsQuery();
