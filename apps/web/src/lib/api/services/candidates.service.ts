import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { CamaraVoto, CandidateDetail, CandidateListFilters, CandidateListItem, PaginatedResponse } from "../types";

export const candidatesService = {
  list: (filters: CandidateListFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.office) params.set("office", filters.office);
    if (filters.state) params.set("state", filters.state);
    if (filters.party) params.set("party", filters.party);
    if (filters.search) params.set("search", filters.search);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return api.get<PaginatedResponse<CandidateListItem>>(
      `${ENDPOINTS.candidates.list}${qs ? `?${qs}` : ""}`,
    );
  },
  detail: (slug: string) => api.get<CandidateDetail>(ENDPOINTS.candidates.detail(slug)),
  votacoes: (slug: string) => api.get<{ dados: CamaraVoto[] }>(ENDPOINTS.candidates.votacoes(slug)),
};
