"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { alertsService } from "@/lib/api/services/alerts.service";

export const ALERTS_KEY = ["alerts"] as const;
export const ALERTS_UNREAD_KEY = ["alerts-unread"] as const;

export function useAlerts(page = 1) {
  return useQuery({
    queryKey: [...ALERTS_KEY, page],
    queryFn: () => alertsService.list(page),
    staleTime: 60_000,
  });
}

export function useUnreadAlertCount() {
  return useQuery({
    queryKey: ALERTS_UNREAD_KEY,
    queryFn: () => alertsService.getUnreadCount(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsService.markRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ALERTS_KEY });
      void qc.invalidateQueries({ queryKey: ALERTS_UNREAD_KEY });
    },
  });
}

export function useMarkAllAlertsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => alertsService.markAllRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ALERTS_KEY });
      qc.setQueryData(ALERTS_UNREAD_KEY, { count: 0 });
    },
  });
}
