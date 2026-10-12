import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EsqueciSenhaForm } from "@/features/auth/esqueci-senha-form";
import { Routes } from "@/routes";

export const metadata: Metadata = {
  title: "Recuperar senha — Smart Politics",
  description: "Recupere o acesso à sua conta Smart Politics.",
};

export default function EsqueciSenhaPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Recuperar senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
        <EsqueciSenhaForm />
      </div>

      <div className="mt-6 text-center">
        <Link
          href={Routes.login()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
