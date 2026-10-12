import type { Query } from "@/lib/queries";
import { evidenceApi } from "../api";
import { mapEvidenceDtoToModel } from "../mappers";
import { mapEvidenceModelToViewModel } from "../view-models";
import type { EvidenceViewModel } from "../view-models";

/** Encapsula o fluxo completo (API → DTO → Mapper → Domain Model → ViewModel) atrás de execute(slug). */
export class GetEvidencesQuery implements Query<string, EvidenceViewModel[]> {
  async execute(slug: string): Promise<EvidenceViewModel[]> {
    const dtos = await evidenceApi.getEvidencesForProfile(slug);
    return dtos.map(mapEvidenceDtoToModel).map(mapEvidenceModelToViewModel);
  }
}

export const getEvidencesQuery = new GetEvidencesQuery();
