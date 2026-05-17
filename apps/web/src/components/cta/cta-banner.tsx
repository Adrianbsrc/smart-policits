import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTABannerProps {
  featureKey: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export function CTABanner({ featureKey, title, description, ctaLabel, ctaHref }: CTABannerProps) {
  const enabled = process.env.NEXT_PUBLIC_CTA_BANNER_ENABLED === "true"
    || process.env[`NEXT_PUBLIC_CTA_${featureKey}_ENABLED`] === "true";

  if (!enabled) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Novidade</p>
        <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
        <Link
          href={ctaHref}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
