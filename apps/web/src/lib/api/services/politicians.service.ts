import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type {
  CamaraVoto,
  ExpenseSummary,
  PaginatedResponse,
  PoliticianDetail,
  PoliticianListFilters,
  PoliticianListItem,
  PoliticalEvent,
  PublicExpense,
  ScoreHistoryPoint,
  ScoreEvidence,
} from "../types";

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
  timeline: (slug: string, params?: { type?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set("type", params.type);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const qstr = qs.toString();
    return api.get<PaginatedResponse<PoliticalEvent>>(
      `${ENDPOINTS.politicians.timeline(slug)}${qstr ? `?${qstr}` : ""}`,
    );
  },
  scoreHistory: (slug: string, limit?: number) => {
    const qs = limit ? `?limit=${limit}` : "";
    return api.get<ScoreHistoryPoint[]>(`${ENDPOINTS.politicians.scoreHistory(slug)}${qs}`);
  },
  scoreEvidence: (slug: string, dimension?: string) => {
    const qs = dimension ? `?dimension=${encodeURIComponent(dimension)}` : "";
    return api.get<ScoreEvidence[]>(`${ENDPOINTS.politicians.scoreEvidence(slug)}${qs}`);
  },
  expenses: (slug: string, params?: { year?: number; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.year) qs.set("year", String(params.year));
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const qstr = qs.toString();
    return api.get<PaginatedResponse<PublicExpense>>(
      `${ENDPOINTS.politicians.expenses(slug)}${qstr ? `?${qstr}` : ""}`,
    );
  },
  expensesSummary: (slug: string, year?: number) => {
    const qs = year ? `?year=${year}` : "";
    return api.get<ExpenseSummary>(`${ENDPOINTS.politicians.expensesSummary(slug)}${qs}`);
  },
};

// Backward compat alias
export const candidatesService = politiciansService;
