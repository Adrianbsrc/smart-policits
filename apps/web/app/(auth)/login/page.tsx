import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/login-form";
import { GlassCard } from "@/components/ui/glass-card";
import { Routes } from "@/routes";

export const metadata: Metadata = {
  title: "Entrar — Smart Politics",
  description: "Faça login na sua conta Smart Politics.",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      {/* Headline */}
      <div className="mb-6 text-center">
        <h1 className="font-display text-[1.75rem] font-bold tracking-tight text-foreground">
          Bem-vindo de volta
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Entre com sua conta para continuar
        </p>
      </div>

      {/* Form card */}
      <GlassCard accentColor="var(--primary)">
        <LoginForm />

        <div className="mt-5 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link
            href={Routes.cadastro()}
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Criar conta grátis
          </Link>
        </div>
      </GlassCard>

      {/* Legal */}
      <p className="mt-5 text-center text-xs text-muted-foreground">
        Ao entrar você concorda com os{" "}
        <Link href={Routes.termos()} className="underline underline-offset-4 hover:text-foreground">
          Termos de Uso
        </Link>{" "}
        e{" "}
        <Link href={Routes.privacidade()} className="underline underline-offset-4 hover:text-foreground">
          Política de Privacidade
        </Link>
        .
      </p>
    </div>
  );
}
