"use client";

import { useQuery } from "@tanstack/react-query";
import { getTimelineQuery } from "../queries";

/**
 * Fino: só invoca o Query Object e devolve o resultado ao react-query.
 * Toda a orquestração (API → DTO → Mapper → Model) vive em GetTimelineQuery.
 */
export function useTimeline(slug: string) {
  return useQuery({
    queryKey: ["timeline", slug],
    queryFn: () => getTimelineQuery.execute(slug),
    staleTime: 60 * 60_000,
    enabled: Boolean(slug),
  });
}
