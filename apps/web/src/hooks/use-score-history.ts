"use client";

import { useQuery } from "@tanstack/react-query";
import { politiciansService } from "@/lib/api/services";

export function useScoreHistory(slug: string, enabled = true) {
  return useQuery({
    queryKey: ["politicians", "score-history", slug],
    queryFn: () => politiciansService.scoreHistory(slug),
    staleTime: 60 * 60_000,
    enabled: Boolean(slug) && enabled,
  });
}

export function useScoreEvidence(slug: string, dimension?: string, enabled = true) {
  return useQuery({
    queryKey: ["politicians", "score-evidence", slug, dimension],
    queryFn: () => politiciansService.scoreEvidence(slug, dimension),
    staleTime: 30 * 60_000,
    enabled: Boolean(slug) && enabled,
  });
}
