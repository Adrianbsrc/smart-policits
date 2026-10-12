import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { promiseListDtoSchema } from "../validations";
import type { PromiseDto } from "../validations";

/**
 * Camada de acesso HTTP crua. Busca o endpoint e valida a resposta em
 * runtime com Zod antes de devolvê-la tipada como DTO. Consumida apenas
 * por hooks/ (fluxo direto api → mapper, sem services/ intermediário).
 */
export const promisesApi = {
  async getPromises(slug: string): Promise<PromiseDto[]> {
    const raw = await api.get<unknown>(ENDPOINTS.politicalProfiles.promises(slug));
    return promiseListDtoSchema.parse(raw);
  },
};
