"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { sendPasswordReset } from "@/features/auth/auth.service";
import { esqueciSenhaSchema, type EsqueciSenhaFormValues } from "@/features/auth/schemas";
import { Routes } from "@/routes";

export function EsqueciSenhaForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EsqueciSenhaFormValues>({ resolver: zodResolver(esqueciSenhaSchema) });

  async function onSubmit(values: EsqueciSenhaFormValues) {
    setServerError(null);
    try {
      await sendPasswordReset(values.email);
      setEmailSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erro ao enviar e-mail");
    }
  }

  if (emailSent) {
    return (
      <div className="mt-8 rounded-xl border border-border bg-background p-6 text-center">
        <span className="text-4xl">📧</span>
        <h2 className="mt-4 font-semibold text-foreground">Link enviado!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Verifique sua caixa de entrada e clique no link para redefinir sua senha.
        </p>
        <Link href={Routes.login()} className="mt-4 inline-block text-sm text-primary hover:underline">
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Enviando…" : "Enviar link de recuperação"}
      </button>
    </form>
  );
}
