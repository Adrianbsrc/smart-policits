"use client";

import Link from "next/link";
import { BarChart3, Heart, ClipboardList, Award } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useFollows } from "@/hooks/use-follows";
import { useLatestQuizResult } from "@/hooks/use-quiz";
import { OFFICE_LABELS, SCORE_LABELS_FULL } from "@/lib/content/labels";

const QUICK_ACTIONS = [
  { href: "/quiz", icon: BarChart3, label: "Refazer Quiz", description: "Atualizar seu perfil eleitoral" },
  { href: "/ranking", icon: Award, label: "Ver Ranking", description: "Explorar candidatos" },
  { href: "/cola-eleitoral", icon: ClipboardList, label: "Cola Eleitoral", description: "Montar sua lista" },
  { href: "/favoritos", icon: Heart, label: "Favoritos", description: "Candidatos que você segue" },
] as const;

const POLL_OPTIONS = [
  "Saúde pública",
  "Educação básica",
  "Segurança pública",
  "Economia e emprego",
] as const;

export default function DashboardPage() {
  const { data: follows = [], isLoading: followsLoading } = useFollows();
  const { data: quizResult, isLoading: quizLoading } = useLatestQuizResult();

  const topMatch = quizResult?.matches[0];
  const office = (key: string) => OFFICE_LABELS[key as keyof typeof OFFICE_LABELS] ?? key;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Bom dia!</h1>
        <p className="mt-1 text-muted-foreground">Aqui está um resumo do seu acompanhamento político.</p>
      </div>

      {/* Quick actions */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 rounded-xl border border-border bg-background p-4 transition-all hover:border-border-strong hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quiz result summary */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-background p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Seu último resultado</h2>
            {quizResult ? (
              <Link href="/resultado" className="text-sm font-medium text-primary hover:text-primary/80">
                Ver detalhes →
              </Link>
            ) : (
              <Link href="/quiz" className="text-sm font-medium text-primary hover:text-primary/80">
                Fazer quiz →
              </Link>
            )}
          </div>

          {quizLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-5 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : quizResult ? (
            <>
              <div className="flex flex-col gap-2">
                {(Object.entries(quizResult.weights) as [string, number][])
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, val]) => {
                    const max = Math.max(...Object.values(quizResult.weights));
                    const pct = Math.round((val / max) * 100);
                    const label = SCORE_LABELS_FULL[key as keyof typeof SCORE_LABELS_FULL] ?? key;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
              </div>
              {topMatch && (
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-primary/5 px-3 py-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    1
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{topMatch.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Melhor match: {topMatch.matchPercent}% · Nota {topMatch.score.toFixed(1)}
                    </p>
                  </div>
                  <Link
                    href={`/candidato/${topMatch.slug}`}
                    className="shrink-0 text-xs font-medium text-primary hover:text-primary/80"
                  >
                    Ver perfil
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">Você ainda não fez o quiz político.</p>
              <Link
                href="/quiz"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Fazer agora
              </Link>
            </div>
          )}
        </div>

        {/* Followed candidates */}
        <div className="rounded-xl border border-border bg-background p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Favoritos</h2>
            <Link href="/favoritos" className="text-sm font-medium text-primary hover:text-primary/80">
              Ver todos →
            </Link>
          </div>

          {followsLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : follows.length > 0 ? (
            <div className="flex flex-col gap-2">
              {follows.slice(0, 3).map((f) => (
                <Link
                  key={f.id}
                  href={`/candidato/${f.candidate.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {f.candidate.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{f.candidate.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.candidate.party?.acronym ?? "—"} · {office(f.candidate.office)}
                    </p>
                  </div>
                  {f.candidate.score && (
                    <span className="shrink-0 text-sm font-bold tabular-nums">
                      {f.candidate.score.overall.toFixed(1)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum favorito ainda.
            </p>
          )}

          <Link
            href="/ranking"
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            + Adicionar candidatos
          </Link>
        </div>
      </div>

      {/* Poll */}
      <div className="mt-6 rounded-xl border border-border bg-background-subtle p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Enquete da semana</h2>
          <Badge variant="primary" size="sm">Nova</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Qual tema deveria ser prioridade na próxima eleição?</p>
        <div className="mt-4 flex flex-col gap-2">
          {POLL_OPTIONS.map((opt) => (
            <button
              key={opt}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-left text-sm text-foreground transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-border" />
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
