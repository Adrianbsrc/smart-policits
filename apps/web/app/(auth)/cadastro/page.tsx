import type { Metadata } from "next";
import Link from "next/link";
import { CadastroForm } from "@/features/auth/cadastro-form";

export const metadata: Metadata = {
  title: "Criar conta — Smart Politics",
  description: "Crie sua conta na Smart Politics. Gratuito e sem cartão de crédito.",
};

export default function CadastroPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Crie sua conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">Gratuito. Sem cartão. Sem viés político.</p>
      </div>

      <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
        <CadastroForm />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            Entrar
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Ao criar sua conta, você concorda com os{" "}
        <Link href="/termos" className="underline underline-offset-4 hover:text-foreground">Termos de Uso</Link>
        {" "}e{" "}
        <Link href="/privacidade" className="underline underline-offset-4 hover:text-foreground">Política de Privacidade</Link>.
      </p>
    </div>
  );
}
