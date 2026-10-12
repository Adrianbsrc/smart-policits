import { z } from "zod";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  executiveSummaryDtoSchema,
  mandateDtoSchema,
  paginatedDtoSchema,
  politicalAffiliationDtoSchema,
  politicalProfileDtoSchema,
} from "../validations";
import type {
  ExecutiveSummaryDto,
  MandateDto,
  PoliticalAffiliationDto,
  PoliticalProfileDto,
  PoliticalProfileListFilters,
} from "../validations";

/**
 * Camada de acesso HTTP crua da feature. Cada função busca o endpoint e
 * valida a resposta em runtime com Zod antes de devolvê-la tipada como DTO —
 * nunca confia apenas na tipagem estática do `fetch`. Consumida apenas por
 * services/ (nunca diretamente por hooks/componentes).
 */

function buildListSearchParams(filters: PoliticalProfileListFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.partyId) params.set("partyId", filters.partyId);
  if (filters.officeId) params.set("officeId", filters.officeId);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const politicalProfileApi = {
  async list(filters: PoliticalProfileListFilters = {}) {
    const raw = await api.get<unknown>(`${ENDPOINTS.politicalProfiles.list}${buildListSearchParams(filters)}`);
    return paginatedDtoSchema(politicalProfileDtoSchema).parse(raw);
  },

  async getDetail(slug: string): Promise<PoliticalProfileDto> {
    const raw = await api.get<unknown>(ENDPOINTS.politicalProfiles.detail(slug));
    return politicalProfileDtoSchema.parse(raw);
  },

  async getMandates(slug: string): Promise<MandateDto[]> {
    const raw = await api.get<unknown>(ENDPOINTS.politicalProfiles.mandates(slug));
    return z.array(mandateDtoSchema).parse(raw);
  },

  async getAffiliations(slug: string): Promise<PoliticalAffiliationDto[]> {
    const raw = await api.get<unknown>(ENDPOINTS.politicalProfiles.affiliations(slug));
    return z.array(politicalAffiliationDtoSchema).parse(raw);
  },

  async getExecutiveSummary(slug: string): Promise<ExecutiveSummaryDto> {
    const raw = await api.get<unknown>(ENDPOINTS.politicalProfiles.executiveSummary(slug));
    return executiveSummaryDtoSchema.parse(raw);
  },
};
