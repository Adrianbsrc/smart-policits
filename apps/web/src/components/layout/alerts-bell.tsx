"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, TrendingDown, TrendingUp } from "lucide-react";

import { useAlerts, useMarkAllAlertsRead, useMarkAlertRead, useUnreadAlertCount } from "@/hooks/use-alerts";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { Alert } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes";

function AlertItem({ alert, onRead }: { alert: Alert; onRead: (id: string) => void }) {
  const isScoreChange = alert.type === "score_change";
  const isPositive = isScoreChange && alert.body.includes("subiu");

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
        !alert.read && "bg-primary/5",
      )}
    >
      <div className="mt-0.5 shrink-0">
        {isScoreChange ? (
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-full", isPositive ? "bg-success/10" : "bg-destructive/10")}>
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            )}
          </div>
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-3.5 w-3.5 text-primary" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-foreground">{alert.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{alert.body}</p>
        {alert.politician && (
          <Link
            href={Routes.legacyPoliticianProfile(alert.politician.slug)}
            className="mt-1 inline-block text-xs font-medium text-primary hover:text-primary/80"
            onClick={() => !alert.read && onRead(alert.id)}
          >
            Ver perfil →
          </Link>
        )}
      </div>

      {!alert.read && (
        <button
          onClick={() => onRead(alert.id)}
          className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label="Marcar como lido"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function AlertsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const { data: unread } = useUnreadAlertCount();
  const { data: alerts, isLoading } = useAlerts(1);
  const { mutate: markRead } = useMarkAlertRead();
  const { mutate: markAll, isPending: markingAll } = useMarkAllAlertsRead();

  const count = unread?.count ?? 0;
  const items = alerts?.data ?? [];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={count > 0 ? `${count} alertas não lidos` : "Alertas"}
        aria-expanded={open}
      >
        <Bell className="h-4.5 w-4.5" />
        {count > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold leading-none text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-sm font-semibold text-foreground">Alertas</p>
            {count > 0 && (
              <button
                onClick={() => markAll()}
                disabled={markingAll}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todos
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {isLoading ? (
              <div className="flex h-20 items-center justify-center">
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-20 flex-col items-center justify-center gap-1 px-4">
                <Bell className="h-5 w-5 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Nenhum alerta</p>
              </div>
            ) : (
              items.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onRead={(id) => markRead(id)}
                />
              ))
            )}
          </div>

          {(alerts?.meta.total ?? 0) > items.length && (
            <div className="border-t border-border px-4 py-2.5 text-center">
              <p className="text-xs text-muted-foreground">
                {alerts!.meta.total} alertas no total
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
