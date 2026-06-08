import { cn } from "@/lib/utils";

type PillTone = "neutral" | "good" | "bad" | "warn" | "accent" | "gold";

interface LiqPillProps {
  children: React.ReactNode;
  tone?: PillTone;
  className?: string;
}

const TONE_CLASSES: Record<PillTone, string> = {
  neutral: "bg-muted/80 text-muted-foreground",
  good:    "bg-success/14 text-success",
  bad:     "bg-destructive/14 text-destructive",
  warn:    "bg-warning/16 text-warning",
  accent:  "bg-primary/20 text-primary",
  gold:    "bg-gold/15 text-gold",
};

/**
 * Pill/badge minimalista do Liquid Civic.
 * Uso: <LiqPill tone="accent">● Atualizado há 6 min</LiqPill>
 */
export function LiqPill({ children, tone = "neutral", className }: LiqPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.01em]",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
