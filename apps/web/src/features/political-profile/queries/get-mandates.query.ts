import type { Query } from "@/lib/queries";
import { politicalProfileApi } from "../api";
import { mapMandateDtoToModel } from "../mappers";
import { mapMandateModelToViewModel } from "../view-models";
import type { MandateViewModel } from "../view-models";

/** Encapsula o fluxo completo (API → DTO → Mapper → Domain Model → ViewModel) atrás de execute(slug). */
export class GetMandatesQuery implements Query<string, MandateViewModel[]> {
  async execute(slug: string): Promise<MandateViewModel[]> {
    const dtos = await politicalProfileApi.getMandates(slug);
    return dtos.map(mapMandateDtoToModel).map(mapMandateModelToViewModel);
  }
}

export const getMandatesQuery = new GetMandatesQuery();
