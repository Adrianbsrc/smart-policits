"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, Bell } from "lucide-react";
import { useFollows } from "@/hooks/use-follows";
import { useAlerts } from "@/hooks/use-alerts";
import { useRanking } from "@/hooks/use-ranking";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PoliticianAvatar } from "@/components/politicians/politician-card";
import { FollowButton } from "@/components/politicians/follow-button";
import { GlassCard } from "@/components/ui/glass-card";
import { LiqPill } from "@/components/ui/liq-pill";
import { AdSlot } from "@/components/ui/ad-slot";
import { Routes } from "@/routes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ELECTION_DATE = new Date("2026-10-04T00:00:00-03:00");

function getDaysUntilElection(): number {
  const diff = ELECTION_DATE.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function getFormattedDateTime(): string {
  const now = new Date();
  const date = now
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

const ALERT_TYPE_LABELS: Record<string, { label: string; tone: "good" | "warn" | "accent" | "neutral" }> = {
  score_change: { label: "ALERTA",  tone: "warn"   },
  news:         { label: "NOTÍCIA", tone: "neutral" },
  votacao:      { label: "VOTAÇÃO", tone: "accent"  },
  projeto:      { label: "PROJETO", tone: "accent"  },
};

// ─── DashboardClient ──────────────────────────────────────────────────────────

export function DashboardClient() {
  const [userName, setUserName] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState<string>("");

  const { data: follows = [],  isLoading: followsLoading } = useFollows();
  const { data: alertsData,    isLoading: alertsLoading  } = useAlerts(1);
  const { data: rankingData }                              = useRanking({ limit: 8 });

  const alerts      = alertsData?.data ?? [];
  const unreadCount = useMemo(() => alerts.filter((a) => !a.read).length, [alerts]);

  const followedIds = useMemo(() => new Set(follows.map((f) => f.politician.id)), [follows]);
  const suggestions = useMemo(
    () => (rankingData?.data ?? []).filter((p) => !followedIds.has(p.id)).slice(0, 3),
    [rankingData, followedIds],
  );

  const daysLeft  = getDaysUntilElection();
  const firstName = userName?.split(" ")[0] ?? null;

  useEffect(() => {
    setDateTime(getFormattedDateTime());
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata as Record<string, unknown> | undefined;
      const name = (meta?.full_name ?? meta?.name ?? data.user?.email ?? null) as string | null;
      setUserName(name);
    });
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Fundo Liquid */}
      <div className="page-gradient pointer-events-none fixed inset-0 -z-10 opacity-70" aria-hidden />
      <div className="dot-pattern pointer-events-none fixed inset-0 -z-10 opacity-30" aria-hidden />

      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {dateTime && (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {dateTime}
              </p>
            )}
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {getGreeting()}
              {firstName && <>, <span className="text-primary">{firstName}</span></>}.
            </h1>
            {follows.length > 0 && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                Você segue{" "}
                <span className="font-semibold text-foreground">{follows.length}</span>{" "}
                {follows.length === 1 ? "parlamentar" : "parlamentares"}.
                {unreadCount > 0 && (
                  <>
                    {" "}Há{" "}
                    <span className="font-semibold text-foreground">
                      {unreadCount} {unreadCount === 1 ? "novidade" : "novidades"}
                    </span>
                    {" "}para ver.
                  </>
                )}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href={Routes.ranking()}
              className="inline-flex h-9 items-center gap-1.5 rounded-[12px] border border-border glass px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar parlamentar
            </Link>
            <Link
              href={Routes.quiz()}
              className="inline-flex h-9 items-center gap-1.5 rounded-[12px] bg-primary px-4 text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
            >
              Fazer Quiz Eleitoral
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Top: countdown + billboard ── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Countdown */}
          <GlassCard accentColor="var(--primary)" className="flex flex-col justify-center">
            <LiqPill tone="accent" className="self-start">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Eleições 2026
            </LiqPill>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-7xl font-extrabold leading-none tabular-nums text-foreground">
                {daysLeft}
              </span>
              <span className="text-xl font-medium text-muted-foreground">dias</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              até o 1º turno · 4 de outubro
            </p>
          </GlassCard>

          {/* Billboard */}
          <div className="col-span-2">
            <AdSlot
              slot="dashboard-billboard"
              format="billboard"
              note="970 × 250 · billboard · dashboard topo"
              className="h-full min-h-[160px]"
            />
          </div>
        </div>

        {/* ── Main grid: left + sidebar ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* Left (3/5) */}
          <div className="flex flex-col gap-6 lg:col-span-3">

            {/* Seus seguidos */}
            <GlassCard>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Seus seguidos</h2>
                <Link href={Routes.favoritos()} className="text-[13px] font-medium text-primary hover:text-primary/80">
                  Ver favoritos →
                </Link>
              </div>

              {followsLoading ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 skeleton rounded-xl" />
                  ))}
                </div>
              ) : follows.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Você ainda não segue nenhum parlamentar.
                  </p>
                  <Link
                    href={Routes.ranking()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-2 text-[13px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Encontrar parlamentares
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {follows.slice(0, 4).map((f) => {
                    const isMock  = !f.politician.score || f.politician.score.scoreType === "mock";
                    const overall = isMock ? null : f.politician.score!.overall.toFixed(1);
                    return (
                      <Link
                        key={f.id}
                        href={Routes.legacyPoliticianProfile(f.politician.slug)}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 backdrop-blur-sm transition-all hover:border-border hover:bg-background"
                      >
                        <PoliticianAvatar
                          name={f.politician.name}
                          photoUrl={f.politician.photoUrl}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {f.politician.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {f.politician.party?.acronym ?? "—"} · {f.politician.state ?? "—"}
                          </p>
                        </div>
                        <span className="shrink-0 font-display text-sm font-bold tabular-nums text-foreground">
                          {overall ?? "—"}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </GlassCard>

            {/* Sugestões */}
            {suggestions.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Sugestões pra você</h2>
                  <span className="text-xs text-muted-foreground">baseado nos seus interesses</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {suggestions.map((p) => {
                    const isMock  = !p.score || p.score.scoreType === "mock";
                    const overall = isMock ? null : p.score!.overall.toFixed(1);
                    return (
                      <GlassCard
                        key={p.id}
                        className="flex flex-col items-center gap-3 pb-4 pt-5 text-center"
                      >
                        <PoliticianAvatar name={p.name} photoUrl={p.photoUrl} />
                        <div className="min-w-0 w-full">
                          <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.party?.acronym ?? "—"} · {p.state ?? "—"}
                          </p>
                          {overall !== null && (
                            <p className="mt-1 font-display text-base font-bold text-foreground">
                              {overall}
                            </p>
                          )}
                        </div>
                        <FollowButton candidateId={p.id} variant="full" className="w-full" />
                      </GlassCard>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right sidebar (2/5) */}
          <div className="flex flex-col gap-5 lg:col-span-2">

            {/* Alertas */}
            <GlassCard>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">Alertas dos seus seguidos</h2>
                </div>
                {unreadCount > 0 && (
                  <LiqPill tone="accent">{unreadCount} novos</LiqPill>
                )}
              </div>

              {alertsLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 skeleton rounded-xl" />
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">Sem novidades no momento.</p>
              ) : (
                <ol className="flex flex-col divide-y divide-border/60">
                  {alerts.slice(0, 4).map((alert) => {
                    const typeInfo = ALERT_TYPE_LABELS[alert.type] ?? {
                      label: alert.type.toUpperCase(),
                      tone: "neutral" as const,
                    };
                    const dateStr = new Date(alert.createdAt)
                      .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                      .replace(".", "");
                    return (
                      <li key={alert.id} className="py-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">{dateStr}</span>
                          <LiqPill tone={typeInfo.tone}>{typeInfo.label}</LiqPill>
                        </div>
                        <p className="text-sm font-medium leading-snug text-foreground">
                          {alert.body}
                        </p>
                        {alert.politician && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {alert.politician.name}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}

              <Link
                href={Routes.feed()}
                className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:text-primary/80"
              >
                Abrir feed completo
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </GlassCard>

            {/* Quiz CTA */}
            <GlassCard accentColor="var(--primary)">
              <LiqPill tone="accent" className="mb-3">
                10 perguntas · 3 minutos
              </LiqPill>
              <h2 className="text-lg font-bold leading-snug text-foreground">
                Descubra quem mais combina com suas ideias.
              </h2>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Responda 10 perguntas sobre temas reais em pauta no Congresso. Mostraremos os
                candidatos mais alinhados.
              </p>
              <Link
                href={Routes.quiz()}
                className="flex w-full items-center justify-center gap-1.5 rounded-[12px] bg-primary py-2.5 text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
              >
                Fazer Quiz Eleitoral
                <ArrowRight className="h-4 w-4" />
              </Link>
            </GlassCard>

            {/* Sidebar ad */}
            <AdSlot
              slot="dashboard-sidebar"
              format="rectangle"
              note="300 × 250 · retângulo · sidebar dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
