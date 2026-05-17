import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { FeedItem, PaginatedResponse } from "../types";

export type ManualFeedItemType = "news" | "law_update" | "poll" | "generic";

export interface CreateFeedItemPayload {
  type: ManualFeedItemType;
  title: string;
  summary?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  metadata?: Record<string, unknown>;
  publishedAt?: string;
  expiresAt?: string;
  active?: boolean;
  politicianId?: string;
}

export interface UpdateFeedItemPayload extends Partial<CreateFeedItemPayload> {}

export const feedService = {
  list: (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return api.get<PaginatedResponse<FeedItem>>(`${ENDPOINTS.feed.list}?${params.toString()}`);
  },

  listItems: (page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return api.get<PaginatedResponse<FeedItem>>(`${ENDPOINTS.feed.items}?${params.toString()}`);
  },

  createItem: (payload: CreateFeedItemPayload) =>
    api.post<FeedItem>(ENDPOINTS.feed.items, payload),

  updateItem: (id: string, payload: UpdateFeedItemPayload) =>
    api.patch<FeedItem>(ENDPOINTS.feed.item(id), payload),

  deleteItem: (id: string) =>
    api.delete<void>(ENDPOINTS.feed.item(id)),
};
