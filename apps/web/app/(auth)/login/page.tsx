import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar — Smart Politics",
  description: "Faça login na sua conta Smart Politics.",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Bem-vindo de volta</h1>
        <p className="mt-2 text-sm text-muted-foreground">Entre com sua conta para continuar</p>
      </div>

      <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
        <LoginForm />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-primary hover:text-primary/80">
            Criar conta grátis
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Ao entrar você concorda com os{" "}
        <Link href="/termos" className="underline underline-offset-4 hover:text-foreground">Termos de Uso</Link>
        {" "}e{" "}
        <Link href="/privacidade" className="underline underline-offset-4 hover:text-foreground">Política de Privacidade</Link>.
      </p>
    </div>
  );
}
