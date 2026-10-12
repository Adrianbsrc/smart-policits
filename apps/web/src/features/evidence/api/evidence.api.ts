import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { evidenceDtoSchema, evidenceListDtoSchema } from "../validations";
import type { EvidenceDto } from "../validations";

/**
 * Camada de acesso HTTP crua. Busca o endpoint e valida a resposta em
 * runtime com Zod antes de devolvê-la tipada como DTO. Primeiro elo do
 * fluxo API → DTO → Mapper → Domain Model → ViewModel Mapper → View Model
 * → Hook → Component.
 */
export const evidenceApi = {
  async getEvidencesForProfile(slug: string): Promise<EvidenceDto[]> {
    const raw = await api.get<unknown>(ENDPOINTS.politicalProfiles.evidences(slug));
    return evidenceListDtoSchema.parse(raw);
  },

  async getEvidenceById(id: string): Promise<EvidenceDto> {
    const raw = await api.get<unknown>(ENDPOINTS.evidences.detail(id));
    return evidenceDtoSchema.parse(raw);
  },
};
