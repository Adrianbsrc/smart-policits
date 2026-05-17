"use client";

import { useQuery } from "@tanstack/react-query";
import { candidatesService } from "@/lib/api/services";

export function useCandidate(slug: string) {
  return useQuery({
    queryKey: ["candidates", "detail", slug],
    queryFn: () => candidatesService.detail(slug),
    staleTime: 5 * 60_000,
    enabled: Boolean(slug),
  });
}
