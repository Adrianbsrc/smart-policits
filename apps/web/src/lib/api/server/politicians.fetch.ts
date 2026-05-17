import { ENDPOINTS } from "../endpoints";
import type { CandidateListItem, PaginatedResponse } from "../types";

const BASE_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

async function fetchByOffice(
  office: string,
  options: { state?: string; search?: string; limit?: number },
  revalidate = 3600,
): Promise<CandidateListItem[]> {
  const params = new URLSearchParams({ office, limit: String(options.limit ?? 100) });
  if (options.state) params.set("state", options.state);
  if (options.search) params.set("search", options.search);

  const res = await fetch(`${BASE_URL}/api${ENDPOINTS.candidates.list}?${params.toString()}`, {
    next: { revalidate },
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) return [];

  const json = (await res.json()) as PaginatedResponse<CandidateListItem>;
  return json.data;
}

export const fetchPresidents = (options?: { revalidate?: number }) =>
  fetchByOffice("president", { limit: 20 }, options?.revalidate ?? 3600);

export const fetchGovernors = (options?: { state?: string; revalidate?: number }) =>
  fetchByOffice("governor", { state: options?.state, limit: 50 }, options?.revalidate ?? 3600);

export const fetchStateDeputies = (options?: {
  state?: string;
  search?: string;
  limit?: number;
  revalidate?: number;
}) =>
  fetchByOffice(
    "state_deputy",
    { state: options?.state, search: options?.search, limit: options?.limit ?? 100 },
    options?.revalidate ?? 3600,
  );

export const fetchFederalDeputies = (options?: {
  state?: string;
  search?: string;
  limit?: number;
  revalidate?: number;
}) =>
  fetchByOffice(
    "federal_deputy",
    { state: options?.state, search: options?.search, limit: options?.limit ?? 100 },
    options?.revalidate ?? 3600,
  );

export const fetchSenators = (options?: { state?: string; revalidate?: number }) =>
  fetchByOffice("senator", { state: options?.state, limit: 81 }, options?.revalidate ?? 3600);
