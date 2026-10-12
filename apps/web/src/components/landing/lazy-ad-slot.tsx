"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { AD_FORMATS, type AdFormat } from "@/components/ui/ad-slot";

/**
 * Adia o JS do AdSlot para depois da renderização inicial (docs/SPECs/home.md#performance)
 * — `ssr: false` só é permitido a partir de um Client Component, daí este
 * wrapper. A arquitetura do próprio AdSlot (`components/ui/ad-slot.tsx`) não
 * é alterada, só o ponto em que ela é importada.
 */
const AdSlot = dynamic(() => import("@/components/ui/ad-slot").then((mod) => mod.AdSlot), {
  ssr: false,
  loading: () => null,
});

export interface LazyAdSlotProps {
  slot: string;
  format?: AdFormat;
  tone?: "soft" | "invert";
  note?: string;
  className?: string;
}

/** Reserva a mesma altura do formato final para não causar layout shift quando o slot montar. */
export function LazyAdSlot({ slot, format = "banner-wide", tone, note, className }: LazyAdSlotProps) {
  const cfg = AD_FORMATS[format] ?? AD_FORMATS["banner-wide"];

  return (
    <div className={cn(cfg.minH, "maxW" in cfg && cfg.maxW, "mx-auto w-full", className)}>
      <AdSlot slot={slot} format={format} tone={tone} note={note} />
    </div>
  );
}
