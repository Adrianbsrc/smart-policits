import type { Query } from "@/lib/queries";
import { evidenceApi } from "../api";
import { mapEvidenceDtoToModel } from "../mappers";
import { mapEvidenceModelToViewModel } from "../view-models";
import type { EvidenceViewModel } from "../view-models";

/** Encapsula o fluxo completo (API → DTO → Mapper → Domain Model → ViewModel) atrás de execute(id). */
export class GetEvidenceByIdQuery implements Query<string, EvidenceViewModel> {
  async execute(id: string): Promise<EvidenceViewModel> {
    const dto = await evidenceApi.getEvidenceById(id);
    return mapEvidenceModelToViewModel(mapEvidenceDtoToModel(dto));
  }
}

export const getEvidenceByIdQuery = new GetEvidenceByIdQuery();
