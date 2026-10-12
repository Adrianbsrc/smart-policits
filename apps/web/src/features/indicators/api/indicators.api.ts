import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { indicatorListDtoSchema } from "../validations";
import type { IndicatorDto } from "../validations";

/**
 * Camada de acesso HTTP crua. Busca o endpoint e valida a resposta em
 * runtime com Zod antes de devolvê-la tipada como DTO. Primeiro elo do
 * fluxo API → DTO → Mapper → Domain Model → ViewModel Mapper → View Model
 * → Hook → Component.
 */
export const indicatorsApi = {
  async getIndicators(slug: string): Promise<IndicatorDto[]> {
    const raw = await api.get<unknown>(ENDPOINTS.politicalProfiles.indicators(slug));
    return indicatorListDtoSchema.parse(raw);
  },
};
