"use client";

import { useQuery } from "@tanstack/react-query";
import { politiciansService } from "@/lib/api/services";

interface UseTimelineOptions {
  type?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useTimeline(slug: string, options: UseTimelineOptions = {}) {
  const { type, page, limit, enabled = true } = options;
  return useQuery({
    queryKey: ["politicians", "timeline", slug, type, page, limit],
    queryFn: () => politiciansService.timeline(slug, { type, page, limit }),
    staleTime: 15 * 60_000,
    enabled: Boolean(slug) && enabled,
  });
}
