import Link from "next/link";
import type { ElementType } from "react";

interface QuickActionCardProps {
  href: string;
  icon: ElementType;
  label: string;
  description: string;
}

export function QuickActionCard({ href, icon: Icon, label, description }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
