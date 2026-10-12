"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Share2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/empty-state";
import { FavoriteCard } from "@/components/politicians/favorite-card";
import { AdSlot } from "@/components/ui/ad-slot";
import { useFollows } from "@/hooks/use-follows";
import type { FollowedPolitician } from "@/lib/api/types";
import { Routes } from "@/routes";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "todos" | "camara" | "senado";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "todos",  label: "Todos"  },
  { id: "camara", label: "Câmara" },
  { id: "senado", label: "Senado" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCount(follows: FollowedPolitician[], tab: FilterTab): number {
  switch (tab) {
    case "camara": return follows.filter((f) =>
      f.politician.office === "federal_deputy" || f.politician.office === "state_deputy",
    ).length;
    case "senado": return follows.filter((f) => f.politician.office === "senator").length;
    default:       return follows.length;
  }
}

function filterFollows(follows: FollowedPolitician[], tab: FilterTab): FollowedPolitician[] {
  switch (tab) {
    case "camara": return follows.filter((f) =>
      f.politician.office === "federal_deputy" || f.politician.office === "state_deputy",
    );
    case "senado": return follows.filter((f) => f.politician.office === "senator");
    default:       return follows;
  }
}

async function shareList() {
  const url = typeof window !== "undefined" ? window.location.href : "";
  if (navigator.share) {
    try { await navigator.share({ title: "Meus favoritos — Smart Politics", url }); return; } catch { /* fall through */ }
  }
  await navigator.clipboard.writeText(url);
}

// ─── FavoritosClient ──────────────────────────────────────────────────────────

export function FavoritosClient() {
  const { data: follows = [], isLoading } = useFollows();
  const [activeTab, setActiveTab] = useState<FilterTab>("todos");

  const filtered = useMemo(() => filterFollows(follows, activeTab), [follows, activeTab]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 h-8 w-48 skeleton rounded-lg" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = follows.length === 0;

  return (
    <div className="relative min-h-screen">
      <div className="page-gradient pointer-events-none fixed inset-0 -z-10 opacity-60" aria-hidden />

      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {follows.length > 0 ? `${follows.length} parlamentares` : "Favoritos"}
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Você recebe alertas sempre que houver mudança no score ou atividade relevante.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {follows.length > 0 && (
              <button
                onClick={() => void shareList()}
                className="inline-flex items-center gap-1.5 rounded-[12px] border border-border glass px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <Share2 className="h-3.5 w-3.5" />
                Compartilhar
              </button>
            )}
            <Link
              href={Routes.ranking()}
              className="inline-flex items-center gap-1.5 rounded-[12px] bg-primary px-3 py-2 text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Link>
          </div>
        </div>

        {isEmpty ? (
          <EmptyState
            icon={<Heart className="h-6 w-6" />}
            title="Nenhum favorito ainda"
            description="Explore o ranking e siga os parlamentares que mais te interessam."
            action={
              <Link
                href={Routes.ranking()}
                className="inline-flex h-9 items-center gap-1.5 rounded-[12px] bg-primary px-5 text-[13px] font-semibold text-white hover:opacity-90"
              >
                Ver ranking
              </Link>
            }
          />
        ) : (
          <>
            {/* Filter chips */}
            <div className="mb-5 flex items-center gap-2" role="tablist">
              {FILTER_TABS.map((tab) => {
                const count = getCount(follows, tab.id);
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-[12px] border px-3.5 py-1.5 text-[13px] font-medium transition-all",
                      isActive
                        ? "border-primary bg-primary text-white"
                        : "border-border glass text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">Nenhum parlamentar nesta categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {filtered.map((f, idx) => (
                  <Fragment key={f.id}>
                    <FavoriteCard follow={f} />
                    {(idx + 1) % 9 === 0 && (
                      <AdSlot
                        slot="favoritos-native"
                        format="native-card"
                        note="native card · favoritos"
                      />
                    )}
                  </Fragment>
                ))}
              </div>
            )}

            {/* Bottom billboard */}
            <div className="mt-10">
              <AdSlot
                slot="favoritos-bottom"
                format="leaderboard"
                note="728 × 90 · leaderboard · favoritos rodapé"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
