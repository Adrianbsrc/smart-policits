import type { SupabaseClient } from "@supabase/supabase-js";

import type { AuthUser, Session } from "./types";

export async function getSession(supabase: SupabaseClient): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error ?? !data.session) return null;

  const user = data.session.user;
  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      role: (user.user_metadata["role"] as AuthUser["role"]) ?? "user",
    },
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at ?? 0,
  };
}

export async function getUser(supabase: SupabaseClient): Promise<AuthUser | null> {
  const session = await getSession(supabase);
  return session?.user ?? null;
}

export async function requireAuth(supabase: SupabaseClient): Promise<AuthUser> {
  const user = await getUser(supabase);
  if (!user) throw new Error("Unauthorized");
  return user;
}
