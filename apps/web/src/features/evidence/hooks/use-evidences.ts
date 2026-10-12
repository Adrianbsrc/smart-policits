"use client";

import { useQuery } from "@tanstack/react-query";
import { getEvidencesQuery } from "../queries";

/**
 * Fino: só invoca o Query Object e devolve o resultado ao react-query. Toda
 * a orquestração (API → DTO → Mapper → Domain Model → ViewModel) vive em
 * GetEvidencesQuery.
 */
export function useEvidences(slug: string) {
  return useQuery({
    queryKey: ["evidences", slug],
    queryFn: () => getEvidencesQuery.execute(slug),
    staleTime: 60 * 60_000,
    enabled: Boolean(slug),
  });
}
