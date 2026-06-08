import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { PaginatedResponse, RankedPolitician, RankingFilters } from "../types";

export const rankingsService = {
  list: (filters: RankingFilters = {}) => {
    const params = new URLSearchParams();

    // office: suporta string ou string[]
    if (filters.office) {
      const offices = Array.isArray(filters.office) ? filters.office : [filters.office];
      offices.forEach((o) => params.append("office", o));
    }

    // Multi-value: state e party
    if (filters.state) {
      const states = Array.isArray(filters.state) ? filters.state : [filters.state];
      states.forEach((s) => params.append("state", s));
    }
    if (filters.party) {
      const parties = Array.isArray(filters.party) ? filters.party : [filters.party];
      parties.forEach((p) => params.append("party", p));
    }

    if (filters.search)      params.set("search",      filters.search);
    if (filters.fichaLimpa)  params.set("fichaLimpa",  "true");
    if (filters.estreante)   params.set("estreante",   "true");
    if (filters.reeleito)    params.set("reeleito",    "true");
    if (filters.veterano)    params.set("veterano",    "true");
    if (filters.preCandidate) params.set("preCandidate", "true");

    if (filters.sortBy && filters.sortBy !== "overall") params.set("sortBy", filters.sortBy);
    if (filters.page)  params.set("page",  String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));

    const qs = params.toString();
    return api.get<PaginatedResponse<RankedPolitician>>(
      `${ENDPOINTS.rankings.list}${qs ? `?${qs}` : ""}`,
    );
  },
};
