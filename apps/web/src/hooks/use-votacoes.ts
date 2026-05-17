"use client";

import { useQuery } from "@tanstack/react-query";

import { candidatesService } from "@/lib/api/services/candidates.service";

export function useVotacoes(slug: string, enabled = true) {
  return useQuery({
    queryKey: ["votacoes", slug],
    queryFn: () => candidatesService.votacoes(slug),
    staleTime: 5 * 60_000,
    enabled,
  });
}
