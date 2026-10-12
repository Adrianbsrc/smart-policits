import type { Query } from "@/lib/queries";
import { politicalProfileApi } from "../api";
import { mapExecutiveSummaryDtoToModel } from "../mappers";
import { mapExecutiveSummaryModelToViewModel } from "../view-models";
import type { ExecutiveSummaryViewModel } from "../view-models";

/** Encapsula o fluxo completo (API → DTO → Mapper → Domain Model → ViewModel) atrás de execute(slug). */
export class GetExecutiveSummaryQuery implements Query<string, ExecutiveSummaryViewModel> {
  async execute(slug: string): Promise<ExecutiveSummaryViewModel> {
    const dto = await politicalProfileApi.getExecutiveSummary(slug);
    return mapExecutiveSummaryModelToViewModel(mapExecutiveSummaryDtoToModel(dto));
  }
}

export const getExecutiveSummaryQuery = new GetExecutiveSummaryQuery();
