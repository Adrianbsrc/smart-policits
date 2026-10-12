import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { integrityRecordListDtoSchema } from "../validations";
import type { IntegrityRecordDto } from "../validations";

/**
 * Camada de acesso HTTP crua. Busca o endpoint e valida a resposta em
 * runtime com Zod antes de devolvê-la tipada como DTO. Consumida apenas
 * pelo Query Object (ver queries/).
 */
export const integrityApi = {
  async getIntegrityRecords(slug: string): Promise<IntegrityRecordDto[]> {
    const raw = await api.get<unknown>(ENDPOINTS.politicalProfiles.integrity(slug));
    return integrityRecordListDtoSchema.parse(raw);
  },
};
