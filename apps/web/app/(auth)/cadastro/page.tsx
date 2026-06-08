import type { Metadata } from "next";
import Link from "next/link";
import { CadastroForm } from "@/features/auth/cadastro-form";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata: Metadata = {
  title: "Criar conta — Smart Politics",
  description: "Crie sua conta na Smart Politics. Gratuito e sem cartão de crédito.",
};

export default function CadastroPage() {
  return (
    <div className="w-full max-w-sm">
      {/* Headline */}
      <div className="mb-6 text-center">
        <h1 className="font-display text-[1.75rem] font-bold tracking-tight text-foreground">
          Crie sua conta
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Gratuito. Sem cartão. Sem viés político.
        </p>
      </div>

      {/* Form card */}
      <GlassCard accentColor="var(--primary)">
        <CadastroForm />

        <div className="mt-5 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Entrar
          </Link>
        </div>
      </GlassCard>

      {/* Legal */}
      <p className="mt-5 text-center text-xs text-muted-foreground">
        Ao criar sua conta, você concorda com os{" "}
        <Link href="/termos" className="underline underline-offset-4 hover:text-foreground">
          Termos de Uso
        </Link>{" "}
        e{" "}
        <Link href="/privacidade" className="underline underline-offset-4 hover:text-foreground">
          Política de Privacidade
        </Link>
        .
      </p>
    </div>
  );
}
