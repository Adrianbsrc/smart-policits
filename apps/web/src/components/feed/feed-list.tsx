"use client";

import { useEffect, useRef } from "react";
import { useFeed } from "@/hooks/use-feed";
import { PoliticianSpotlightCard } from "./politician-spotlight-card";
import { NewsCard } from "./news-card";
import { LawCard } from "./law-card";
import { PollCard } from "./poll-card";
import { GenericCard } from "./generic-card";
import { FeedCardSkeleton, FeedAdSlotSkeleton } from "./feed-card-skeleton";
import type { FeedItem } from "@/lib/api/types";

const AD_INTERVAL = 5; // insert an ad slot every N cards

function FeedCardRouter({ item }: { item: FeedItem }) {
  switch (item.type) {
    case "politician_spotlight": return <PoliticianSpotlightCard item={item} />;
    case "news":                 return <NewsCard item={item} />;
    case "law_update":           return <LawCard item={item} />;
    case "poll":                 return <PollCard item={item} />;
    case "generic":              return <GenericCard item={item} />;
    default:                     return null;
  }
}

export function FeedList() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting && hasNextPage) void fetchNextPage(); },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  const allItems = data?.pages.flatMap((p) => p.data) ?? [];

  if (isLoading) {
    return (
      <>
        {/* Mobile skeleton */}
        <div className="flex flex-col gap-0 sm:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-dvh">
              <FeedCardSkeleton />
            </div>
          ))}
        </div>
        {/* Desktop skeleton */}
        <div className="hidden grid-cols-1 gap-4 sm:grid md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <FeedCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-base font-medium text-foreground">Nenhum item no feed ainda.</p>
        <p className="text-sm text-muted-foreground">Em breve novidades por aqui.</p>
      </div>
    );
  }

  return (
    <>
      {/* ─── MOBILE: Full-screen snap scroll ─── */}
      <div
        className="sm:hidden"
        style={{
          height: "calc(100dvh - 56px)", // subtract header height
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {allItems.map((item, idx) => (
          <div
            key={item.id}
            style={{
              height: "calc(100dvh - 56px)",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            <FeedCardRouter item={item} />
            {/* Ad slot on mobile */}
            {(idx + 1) % AD_INTERVAL === 0 && idx < allItems.length - 1 && (
              <div
                style={{
                  height: "calc(100dvh - 56px)",
                  scrollSnapAlign: "start",
                }}
              >
                <div className="flex h-full items-center justify-center bg-background">
                  <FeedAdSlotSkeleton />
                </div>
              </div>
            )}
          </div>
        ))}
        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: 1 }} />
        {isFetchingNextPage && (
          <div style={{ height: "calc(100dvh - 56px)", scrollSnapAlign: "start" }}>
            <FeedCardSkeleton />
          </div>
        )}
      </div>

      {/* ─── DESKTOP: Glass card grid ─── */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {allItems.map((item, idx) => (
            <>
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl"
                style={{ minHeight: 420 }}
              >
                <FeedCardRouter item={item} />
              </div>
              {/* Ad slot on desktop every AD_INTERVAL cards */}
              {(idx + 1) % AD_INTERVAL === 0 && idx < allItems.length - 1 && (
                <div key={`ad-${idx}`} className="overflow-hidden rounded-2xl">
                  <FeedAdSlotSkeleton />
                </div>
              )}
            </>
          ))}
        </div>

        {isFetchingNextPage && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <FeedCardSkeleton key={i} />
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="h-px" />
      </div>
    </>
  );
}
