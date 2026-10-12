import type { Query } from "@/lib/queries";
import { integrityApi } from "../api";
import { mapIntegrityRecordDtoToModel } from "../mappers";
import { mapIntegrityRecordModelToViewModel } from "../view-models";
import type { IntegrityRecordViewModel } from "../view-models";

/** Encapsula o fluxo completo (API → DTO → Mapper → Domain Model → ViewModel) atrás de execute(slug). */
export class GetIntegrityQuery implements Query<string, IntegrityRecordViewModel[]> {
  async execute(slug: string): Promise<IntegrityRecordViewModel[]> {
    const dtos = await integrityApi.getIntegrityRecords(slug);
    return dtos.map(mapIntegrityRecordDtoToModel).map(mapIntegrityRecordModelToViewModel);
  }
}

export const getIntegrityQuery = new GetIntegrityQuery();
