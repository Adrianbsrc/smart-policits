import type { CandidateFilters, Office } from "@smart-politics/types";

export const queryKeys = {
  candidates: {
    all: ["candidates"] as const,
    lists: () => [...queryKeys.candidates.all, "list"] as const,
    list: (filters?: CandidateFilters) => [...queryKeys.candidates.lists(), filters] as const,
    detail: (slug: string) => [...queryKeys.candidates.all, "detail", slug] as const,
  },
  rankings: {
    all: ["rankings"] as const,
    byOffice: (office: Office, state?: string) =>
      [...queryKeys.rankings.all, office, state] as const,
  },
} as const;
