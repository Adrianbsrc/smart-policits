"use client";

import { useQuery } from "@tanstack/react-query";
import { politiciansService } from "@/lib/api/services";

export function usePolitician(slug: string) {
  return useQuery({
    queryKey: ["politicians", "detail", slug],
    queryFn: () => politiciansService.detail(slug),
    staleTime: 60 * 60_000,
    enabled: Boolean(slug),
  });
}
