import { AdSlot } from "@/components/ui/ad-slot";

export function FeedCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-muted" style={{ minHeight: 400 }}>
      <div className="absolute inset-0 skeleton" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="mb-2 h-3 w-20 rounded-full bg-white/10" />
        <div className="mb-1.5 h-5 w-4/5 rounded bg-white/10" />
        <div className="mb-4 h-4 w-3/5 rounded bg-white/10" />
        <div className="h-9 w-full rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

export function FeedAdSlotSkeleton({ slot = "feed-card" }: { slot?: string }) {
  return (
    <AdSlot
      slot={slot}
      format="feed-card"
      note="feed card · 400 × 600 · slot nativo no feed"
      className="w-full"
    />
  );
}
