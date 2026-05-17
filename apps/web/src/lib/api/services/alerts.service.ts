import { authedApi } from "../authed-client";
import { ENDPOINTS } from "../endpoints";
import type { Alert, PaginatedResponse } from "../types";

export const alertsService = {
  list(page = 1, limit = 20): Promise<PaginatedResponse<Alert>> {
    return authedApi.get<PaginatedResponse<Alert>>(
      `${ENDPOINTS.alerts.list}?page=${page}&limit=${limit}`,
    );
  },

  getUnreadCount(): Promise<{ count: number }> {
    return authedApi.get<{ count: number }>(ENDPOINTS.alerts.unreadCount);
  },

  markRead(id: string): Promise<{ id: string }> {
    return authedApi.patch<{ id: string }>(ENDPOINTS.alerts.markRead(id), {});
  },

  markAllRead(): Promise<void> {
    return authedApi.patch<void>(ENDPOINTS.alerts.markAllRead, {});
  },
};
