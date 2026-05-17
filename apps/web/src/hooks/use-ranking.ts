"use client";

import { useQuery } from "@tanstack/react-query";
import { rankingsService } from "@/lib/api/services";
import type { RankingFilters } from "@/lib/api/types";

const RANKING_KEYS = {
  all: ["rankings"] as const,
  list: (filters: RankingFilters) => ["rankings", "list", filters] as const,
};

export function useRanking(filters: RankingFilters = {}) {
  return useQuery({
    queryKey: RANKING_KEYS.list(filters),
    queryFn: () => rankingsService.list(filters),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    placeholderData: (prev) => prev,
  });
}
