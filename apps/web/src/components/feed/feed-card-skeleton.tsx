export function FeedCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-muted" style={{ minHeight: 400 }}>
      <div className="absolute inset-0 skeleton" />
      {/* Simulate bottom content panel */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="mb-2 h-3 w-20 rounded-full bg-white/10" />
        <div className="mb-1.5 h-5 w-4/5 rounded bg-white/10" />
        <div className="mb-4 h-4 w-3/5 rounded bg-white/10" />
        <div className="h-9 w-full rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

export function FeedAdSlotSkeleton() {
  const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

  if (enabled) {
    // Placeholder for actual AdSense script — inject here when ready
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-background" style={{ minHeight: 280 }}>
        <span className="text-xs text-muted-foreground">Publicidade</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background/40"
      style={{ minHeight: 280 }}
      aria-hidden="true"
    >
      <div className="h-2 w-16 rounded-full bg-muted" />
      <div className="h-2 w-24 rounded-full bg-muted" />
      <p className="mt-2 text-xs text-muted-foreground/40">Área de publicidade</p>
    </div>
  );
}
