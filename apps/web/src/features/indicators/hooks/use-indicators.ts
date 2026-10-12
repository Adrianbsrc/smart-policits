"use client";

import { useQuery } from "@tanstack/react-query";
import { getIndicatorsQuery } from "../queries";

/**
 * Fino: só invoca o Query Object e devolve o resultado ao react-query.
 * Toda a orquestração (API → DTO → Mapper → Domain Model → ViewModel) vive
 * em GetIndicatorsQuery.
 */
export function useIndicators(slug: string) {
  return useQuery({
    queryKey: ["indicators", slug],
    queryFn: () => getIndicatorsQuery.execute(slug),
    staleTime: 60 * 60_000,
    enabled: Boolean(slug),
  });
}
