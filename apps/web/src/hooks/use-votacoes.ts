"use client";

import { useQuery } from "@tanstack/react-query";

import { politiciansService } from "@/lib/api/services/politicians.service";

export function useVotacoes(slug: string, enabled = true) {
  return useQuery({
    queryKey: ["votacoes", slug],
    queryFn: () => politiciansService.votacoes(slug),
    staleTime: 5 * 60_000,
    enabled,
  });
}
