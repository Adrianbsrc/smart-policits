"use client";

import { useState } from "react";
import { User, Lock, Bell, Palette, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Section = "perfil" | "senha" | "notificacoes" | "aparencia";

const SECTIONS = [
  { key: "perfil" as const, label: "Perfil", icon: User },
  { key: "senha" as const, label: "Senha", icon: Lock },
  { key: "notificacoes" as const, label: "Notificações", icon: Bell },
  { key: "aparencia" as const, label: "Aparência", icon: Palette },
] as const;

export default function ConfiguracoesPage() {
  const [active, setActive] = useState<Section>("perfil");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Configurações</h1>
        <p className="mt-1 text-muted-foreground">Gerencie sua conta e preferências.</p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar nav */}
        <nav className="shrink-0 md:w-48" aria-label="Seções de configurações">
          <ul className="flex flex-row gap-1 overflow-x-auto md:flex-col">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <li key={key}>
                <button
                  onClick={() => setActive(key)}
                  aria-current={active === key ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active === key
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {active === "perfil" && <PerfilSection />}
          {active === "senha" && <SenhaSection />}
          {active === "notificacoes" && <NotificacoesSection />}
          {active === "aparencia" && <AparenciaSection />}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, type = "text", defaultValue, placeholder }: { label: string; type?: string; defaultValue?: string; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-border-strong"
      />
    </div>
  );
}

function SettingsCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function PerfilSection() {
  return (
    <div className="flex flex-col gap-5">
      <SettingsCard title="Informações pessoais" description="Atualize seus dados de perfil.">
        <div className="flex flex-col gap-4">
          <FormField label="Nome completo" defaultValue="Usuário Exemplo" />
          <FormField label="E-mail" type="email" defaultValue="usuario@email.com" />
          <div className="flex justify-end">
            <button className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97]">
              Salvar alterações
            </button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Zona de perigo" description="Ações irreversíveis para sua conta.">
        <button className="flex items-center gap-2 rounded-md border border-destructive/30 px-4 py-2 text-sm text-destructive transition-colors hover:bg-destructive/5">
          <Trash2 className="h-4 w-4" />
          Excluir conta
        </button>
      </SettingsCard>
    </div>
  );
}

function SenhaSection() {
  return (
    <SettingsCard title="Alterar senha" description="Recomendamos usar uma senha forte e única.">
      <div className="flex flex-col gap-4">
        <FormField label="Senha atual" type="password" />
        <FormField label="Nova senha" type="password" />
        <FormField label="Confirmar nova senha" type="password" />
        <div className="flex justify-end">
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97]">
            Atualizar senha
          </button>
        </div>
      </div>
    </SettingsCard>
  );
}

function NotificacoesSection() {
  const items = [
    { label: "Resultados semanais do ranking", description: "Receba por e-mail as mudanças mais relevantes" },
    { label: "Novas enquetes", description: "Seja notificado quando uma nova enquete for publicada" },
    { label: "Atualizações dos seus favoritos", description: "Mudanças nos candidatos que você segue" },
    { label: "Newsletter mensal", description: "Análises editoriais do time Smart Politics" },
  ] as const;

  return (
    <SettingsCard title="Preferências de notificação" description="Escolha quais e-mails deseja receber.">
      <div className="flex flex-col divide-y divide-border">
        {items.map(({ label, description }) => (
          <div key={label} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <div className="peer h-5 w-9 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}

function AparenciaSection() {
  return (
    <SettingsCard title="Aparência" description="Personalize a interface da plataforma.">
      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Tema</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "light", label: "Claro" },
            { value: "dark", label: "Escuro" },
            { value: "system", label: "Sistema" },
          ].map(({ value, label }) => (
            <label key={value} className="flex cursor-pointer flex-col items-center gap-2">
              <div className={cn(
                "flex h-16 w-full items-center justify-center rounded-lg border-2 transition-colors",
                value === "system" ? "border-primary bg-primary/5" : "border-border",
                value === "dark" ? "bg-zinc-900" : "bg-white",
              )}>
                <span className={cn("text-xs font-medium", value === "dark" ? "text-white" : "text-zinc-800")}>Aa</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input type="radio" name="theme" defaultChecked={value === "system"} className="accent-primary" />
                <span className="text-xs text-foreground">{label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </SettingsCard>
  );
}
