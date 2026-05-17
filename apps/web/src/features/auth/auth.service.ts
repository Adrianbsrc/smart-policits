import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos",
  "User already registered": "Este e-mail já está cadastrado",
  "Email not confirmed": "Confirme seu e-mail antes de fazer login",
  "Password should be at least 6 characters": "Senha muito curta",
  "For security purposes, you can only request this once every 60 seconds":
    "Aguarde 60 segundos antes de tentar novamente",
  "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos",
};

function translateError(message: string): string {
  return ERROR_MAP[message] ?? message;
}

export async function loginUser(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(translateError(error.message));
  return data;
}

export async function registerUser(name: string, email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw new Error(translateError(error.message));

  if (data.user) {
    await api.post(ENDPOINTS.users.create, {
      supabaseId: data.user.id,
      email,
      name,
    });
  }

  return data;
}

export async function sendPasswordReset(email: string) {
  const supabase = createSupabaseBrowserClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/redefinir-senha`,
  });
  if (error) throw new Error(translateError(error.message));
}

export async function logoutUser() {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
}
