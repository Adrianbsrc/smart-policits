"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { registerUser } from "@/features/auth/auth.service";
import { cadastroSchema, type CadastroFormValues } from "@/features/auth/schemas";
import { Routes } from "@/routes";

export function CadastroForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroFormValues>({ resolver: zodResolver(cadastroSchema) });

  async function onSubmit(values: CadastroFormValues) {
    setServerError(null);
    try {
      const { session } = await registerUser(values.name, values.email, values.password);
      if (session) {
        router.replace(Routes.dashboard());
        router.refresh();
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erro ao criar conta");
    }
  }

  if (emailSent) {
    return (
      <div className="mt-8 rounded-xl border border-border bg-background p-6 text-center">
        <span className="text-4xl">📬</span>
        <h2 className="mt-4 font-semibold text-foreground">Verifique seu e-mail</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enviamos um link de confirmação. Clique nele para ativar sua conta.
        </p>
        <Link href={Routes.login()} className="mt-4 inline-block text-sm text-primary hover:underline">
          Ir para o login
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
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Nome completo
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Seu nome"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          {...register("name")}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Senha
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          {...register("password")}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          Confirmar senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Criando conta…" : "Criar conta grátis"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Ao criar uma conta, você concorda com nossos{" "}
        <Link href={Routes.termos()} className="underline">
          Termos de Uso
        </Link>{" "}
        e{" "}
        <Link href={Routes.privacidade()} className="underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </form>
  );
}
