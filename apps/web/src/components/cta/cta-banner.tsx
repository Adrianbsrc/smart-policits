import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface CTABannerProps {
  featureKey: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export function CTABanner({ featureKey, title, description, ctaLabel, ctaHref }: CTABannerProps) {
  const enabled =
    process.env.NEXT_PUBLIC_CTA_BANNER_ENABLED === "true" ||
    process.env[`NEXT_PUBLIC_CTA_${featureKey}_ENABLED`] === "true";

  if (!enabled) return null;

  return (
    <GlassCard accentColor="var(--primary)" className="relative overflow-hidden">
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" aria-hidden />
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary/15">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">Novidade</p>
          <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        <Link
          href={ctaHref}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[12px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
        >
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </GlassCard>
  );
}
