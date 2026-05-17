"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { ApiError } from "./client";

const BASE_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

async function getAccessToken(): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function refreshAccessToken(): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();
  const { data: { session }, error } = await supabase.auth.refreshSession();
  if (error || !session) return null;
  return session.access_token;
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = await getAccessToken();

  // Separate caller-supplied headers from rest of options so the spread
  // below does NOT accidentally override the Authorization header we build.
  const { headers: callerHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(callerHeaders as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers,
    ...restOptions,
  });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, { ...restOptions, headers: { ...(callerHeaders as Record<string, string> | undefined), Authorization: `Bearer ${newToken}` } }, false);
    }
    // Refresh failed — session is gone; surface as 401 so callers can redirect.
    throw new ApiError(401, "Sessão expirada. Faça login novamente.");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({})) as { message?: string };
    throw new ApiError(res.status, error.message ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const authedApi = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: "GET", ...init }),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), ...init }),
  patch: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body), ...init }),
  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: "DELETE", ...init }),
};
