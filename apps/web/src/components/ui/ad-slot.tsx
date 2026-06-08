"use client";

import { cn } from "@/lib/utils";

// ─── Formatos suportados ────────────────────────────────────────────────────

const AD_FORMATS = {
  leaderboard:  { minH: "min-h-[90px]",  label: "728 × 90 · Leaderboard" },
  billboard:    { minH: "min-h-[250px]", label: "970 × 250 · Billboard" },
  "banner-wide":{ minH: "min-h-[110px]", label: "Responsivo · 970×90 / 728×90 / 320×50" },
  rectangle:    { minH: "min-h-[250px]", label: "300 × 250 · Medium Rectangle", maxW: "max-w-[300px]" },
  "large-rect": { minH: "min-h-[280px]", label: "336 × 280 · Large Rectangle", maxW: "max-w-[336px]" },
  skyscraper:   { minH: "min-h-[600px]", label: "160 × 600 · Wide Skyscraper", maxW: "max-w-[160px]" },
  "native-row": { minH: "min-h-[88px]",  label: "In-feed native · inline lista" },
  "native-card":{ minH: "min-h-[220px]", label: "In-feed native · card no grid" },
  "feed-card":  { minH: "min-h-0",       label: "Sponsored · full-bleed" },
  "mobile-banner":{ minH: "min-h-[60px]", label: "320 × 50 · Mobile banner" },
  "mobile-rect":{ minH: "min-h-[250px]", label: "300 × 250 · Mobile rect", maxW: "max-w-[300px]" },
} as const;

type AdFormat = keyof typeof AD_FORMATS;

interface AdSlotProps {
  /** Identificador do slot para futura integração com AdSense */
  slot: string;
  format?: AdFormat;
  /** Tom: soft (light bg) | invert (dark bg) */
  tone?: "soft" | "invert";
  /** Nota auxiliar descritiva */
  note?: string;
  className?: string;
}

/**
 * Placeholder de anúncio — preparado para substituição por <ins class="adsbygoogle">.
 * Remove-se sem quebrar o layout (sempre em fluxo normal, nunca absolute).
 *
 * Para ativar AdSense em produção: substituir este componente pela tag <ins>
 * com data-ad-client e data-ad-slot correspondentes ao slot prop.
 */
export function AdSlot({
  slot,
  format = "banner-wide",
  tone = "soft",
  note,
  className,
}: AdSlotProps) {
  const cfg = AD_FORMATS[format] ?? AD_FORMATS["banner-wide"];
  const isDark = tone === "invert";

  return (
    <aside
      data-ad-slot={slot}
      data-ad-format={format}
      aria-label={`Espaço para anúncio · ${cfg.label}`}
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed p-4 text-center",
        cfg.minH,
        "maxW" in cfg && cfg.maxW,
        isDark
          ? "border-white/20 bg-white/5 text-white/70"
          : "border-border-strong bg-muted/60 text-muted-foreground",
        className,
      )}
      style={{
        backgroundImage: isDark
          ? "repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0 1px, transparent 1px 14px)"
          : "repeating-linear-gradient(135deg, rgba(15,23,42,.035) 0 1px, transparent 1px 14px)",
      }}
    >
      {/* Label PUBLICIDADE — recomendação CONAR */}
      <span className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest",
        isDark ? "border-white/25 bg-white/10 text-white/80" : "border-border-strong bg-muted text-muted-foreground",
      )}>
        <span className="h-1 w-1 rounded-full bg-current" />
        Publicidade
      </span>

      <p className="font-mono text-[11px] font-semibold tracking-wide opacity-70">
        {cfg.label}
      </p>

      {note && (
        <p className="max-w-xs text-[10px] opacity-60">{note}</p>
      )}

      <p className="font-mono text-[9px] tracking-wider opacity-40">
        data-ad-slot=&quot;{slot}&quot;
      </p>
    </aside>
  );
}
