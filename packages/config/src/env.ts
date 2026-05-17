import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3001"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function validateServerEnv(env: Record<string, string | undefined>): ServerEnv {
  const parsed = serverEnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables:\n${parsed.error.errors.map((e) => `  ${e.path.join(".")}: ${e.message}`).join("\n")}`,
    );
  }
  return parsed.data;
}

export function validateClientEnv(env: Record<string, string | undefined>): ClientEnv {
  const parsed = clientEnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(
      `Invalid client environment variables:\n${parsed.error.errors.map((e) => `  ${e.path.join(".")}: ${e.message}`).join("\n")}`,
    );
  }
  return parsed.data;
}
