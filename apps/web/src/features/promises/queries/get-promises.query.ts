import type { Query } from "@/lib/queries";
import { promisesApi } from "../api";
import { mapPromiseDtoToModel } from "../mappers";
import { mapPromiseModelToViewModel } from "../view-models";
import type { PromiseViewModel } from "../view-models";

/** Encapsula o fluxo completo (API → DTO → Mapper → Domain Model → ViewModel) atrás de execute(slug). */
export class GetPromisesQuery implements Query<string, PromiseViewModel[]> {
  async execute(slug: string): Promise<PromiseViewModel[]> {
    const dtos = await promisesApi.getPromises(slug);
    return dtos.map(mapPromiseDtoToModel).map(mapPromiseModelToViewModel);
  }
}

export const getPromisesQuery = new GetPromisesQuery();
