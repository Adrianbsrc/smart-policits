"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FeedList } from "./feed-list";

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedTab = "em-alta" | "para-voce" | "seguindo" | "noticias";

const TABS: { id: FeedTab; label: string; pulse?: boolean }[] = [
  { id: "em-alta",   label: "Em alta",   pulse: true },
  { id: "para-voce", label: "Para você"              },
  { id: "seguindo",  label: "Seguindo"               },
  { id: "noticias",  label: "Notícias"               },
];

const TAB_TYPE_FILTER: Partial<Record<FeedTab, string>> = {
  noticias: "news",
};

// ─── PulseDot ─────────────────────────────────────────────────────────────────

function PulseDot() {
  return (
    <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
      <span className="animate-pulse-dot absolute inset-0 rounded-full bg-primary" aria-hidden />
      <span className="absolute inset-[2px] rounded-full bg-primary" aria-hidden />
    </span>
  );
}

// ─── FeedPageClient ───────────────────────────────────────────────────────────

export function FeedPageClient() {
  const [activeTab, setActiveTab] = useState<FeedTab>("em-alta");
  const typeFilter = TAB_TYPE_FILTER[activeTab];

  return (
    <div className="relative min-h-screen">
      {/* Fundo Liquid */}
      <div className="page-gradient pointer-events-none fixed inset-0 -z-10 opacity-70" aria-hidden />

      {/* Desktop tab bar */}
      <div className="glass-strong sticky top-[72px] z-30 hidden border-b border-border/50 sm:block">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "-mb-px inline-flex items-center gap-1.5 border-b-2 px-5 py-3.5 text-[13px] font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.pulse && <PulseDot />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed content */}
      <div className="sm:mx-auto sm:max-w-screen-xl sm:px-4 sm:pb-16 sm:pt-6 lg:px-8">
        <FeedList typeFilter={typeFilter} />
      </div>

      {/* Mobile tab bar — sticky bottom */}
      <div className="glass-strong fixed bottom-14 left-0 right-0 z-30 border-t border-border/50 sm:hidden">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground",
              )}
            >
              {tab.pulse && activeTab !== tab.id && (
                <span className="h-1 w-1 rounded-full bg-primary" />
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
