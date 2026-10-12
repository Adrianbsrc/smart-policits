"use client";

import { useQuery } from "@tanstack/react-query";
import { getPromisesQuery } from "../queries";

/**
 * Fino: só invoca o Query Object e devolve o resultado ao react-query.
 * Toda a orquestração (API → DTO → Mapper → Model) vive em GetPromisesQuery.
 */
export function usePromises(slug: string) {
  return useQuery({
    queryKey: ["promises", slug],
    queryFn: () => getPromisesQuery.execute(slug),
    staleTime: 60 * 60_000,
    enabled: Boolean(slug),
  });
}
