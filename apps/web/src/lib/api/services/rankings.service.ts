import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { PaginatedResponse, RankedCandidate, RankingFilters } from "../types";

export const rankingsService = {
  list: (filters: RankingFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.office) params.set("office", filters.office);
    if (filters.state) params.set("state", filters.state);
    if (filters.party) params.set("party", filters.party);
    if (filters.search) params.set("search", filters.search);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return api.get<PaginatedResponse<RankedCandidate>>(
      `${ENDPOINTS.rankings.list}${qs ? `?${qs}` : ""}`,
    );
  },
};
