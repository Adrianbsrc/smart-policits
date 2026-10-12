"use client";

import { useQuery } from "@tanstack/react-query";
import { getIntegrityQuery } from "../queries";

/**
 * Fino: só invoca o Query Object e devolve o resultado ao react-query.
 * Toda a orquestração (API → DTO → Mapper → Domain Model → ViewModel) vive
 * em GetIntegrityQuery.
 */
export function useIntegrity(slug: string) {
  return useQuery({
    queryKey: ["integrity", slug],
    queryFn: () => getIntegrityQuery.execute(slug),
    staleTime: 60 * 60_000,
    enabled: Boolean(slug),
  });
}
