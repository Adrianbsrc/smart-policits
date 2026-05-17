import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { CamaraVoto, PaginatedResponse, PoliticianDetail, PoliticianListFilters, PoliticianListItem } from "../types";

export const politiciansService = {
  list: (filters: PoliticianListFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.office) params.set("office", filters.office);
    if (filters.state) params.set("state", filters.state);
    if (filters.party) params.set("party", filters.party);
    if (filters.search) params.set("search", filters.search);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return api.get<PaginatedResponse<PoliticianListItem>>(
      `${ENDPOINTS.politicians.list}${qs ? `?${qs}` : ""}`,
    );
  },
  detail: (slug: string) => api.get<PoliticianDetail>(ENDPOINTS.politicians.detail(slug)),
  votacoes: (slug: string) => api.get<{ dados: CamaraVoto[] }>(ENDPOINTS.politicians.votacoes(slug)),
};

// Backward compat alias
export const candidatesService = politiciansService;
