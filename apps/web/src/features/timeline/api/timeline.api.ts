import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { timelineEventListDtoSchema } from "../validations";
import type { TimelineEventDto } from "../validations";

/**
 * Camada de acesso HTTP crua. Busca o endpoint e valida a resposta em
 * runtime com Zod antes de devolvê-la tipada como DTO. Consumida apenas
 * por hooks/ (a feature não tem services/ — o fluxo é direto api → mapper).
 */
export const timelineApi = {
  async getTimeline(slug: string): Promise<TimelineEventDto[]> {
    const raw = await api.get<unknown>(ENDPOINTS.politicalProfiles.timeline(slug));
    return timelineEventListDtoSchema.parse(raw);
  },
};
