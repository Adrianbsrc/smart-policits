"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSenseProps {
  slot: string;
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  responsive?: boolean;
  className?: string;
}

export function AdSense({ slot, format = "auto", responsive = true, className }: AdSenseProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  useEffect(() => {
    if (!publisherId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // AdSense already initialized or blocked
    }
  }, [publisherId]);

  if (!publisherId) {
    // Render placeholder in dev/when not configured
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-xs text-muted-foreground/50 ${className ?? "h-24"}`}
        aria-hidden="true"
      >
        [Ad slot: {slot}]
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client={publisherId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}

// Pre-configured ad placements
export function AdBannerTop({ className }: { className?: string }) {
  return <AdSense slot="top-banner" format="horizontal" className={className} />;
}

export function AdBannerSidebar({ className }: { className?: string }) {
  return <AdSense slot="sidebar" format="vertical" className={className} />;
}

export function AdBannerInFeed({ className }: { className?: string }) {
  return <AdSense slot="in-feed" format="auto" responsive className={className} />;
}
