import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ScoreBar } from "@/components/ui/score-bar";
import { Badge } from "@/components/ui/badge";
import { OFFICE_LABELS, SCORE_LABELS } from "@/lib/content/labels";
import type { RankedCandidate } from "@/lib/api/types";

interface CandidateCardProps {
  candidate: RankedCandidate;
  className?: string;
}

export function CandidateCard({ candidate, className }: CandidateCardProps) {
  const { rank, name, slug, office, state, photoUrl, party, score } = candidate;

  const rankStyle =
    rank === 1
      ? "bg-warning/20 text-warning"
      : rank === 2 || rank === 3
        ? "bg-muted text-foreground/70"
        : "bg-muted text-muted-foreground";

  return (
    <Link
      href={`/candidato/${slug}`}
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all duration-200 hover:border-border-strong hover:shadow-md",
        className,
      )}
      aria-label={`Ver perfil de ${name}`}
    >
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold", rankStyle)}>
        {rank}
      </span>

      <CandidateAvatar name={name} photoUrl={photoUrl} />

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground transition-colors group-hover:text-primary">{name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {party && (
            <span
              className="mr-1.5 inline-block rounded px-1 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: party.colorHex }}
            >
              {party.acronym}
            </span>
          )}
          {OFFICE_LABELS[office] ?? office}
          {state && ` · ${state}`}
        </p>
        {score && (
          <div className="mt-2 hidden gap-3 sm:flex">
            {(["education", "health", "security", "economy", "transparency"] as const).map((key) => (
              <div key={key} className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{SCORE_LABELS[key]}</span>
                <span className="text-xs font-medium tabular-nums text-foreground">{score[key].toFixed(1)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 text-right">
        <p className="text-2xl font-bold tabular-nums text-foreground">
          {score?.overall.toFixed(1) ?? "—"}
        </p>
        <p className="text-xs text-muted-foreground">/ 10</p>
      </div>
    </Link>
  );
}

export function CandidateCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-4">
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-3 w-28 animate-pulse rounded bg-muted" />
      </div>
      <div className="shrink-0 space-y-1 text-right">
        <div className="h-7 w-12 animate-pulse rounded bg-muted" />
        <div className="h-3 w-8 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

// Compact card variant for profile page sidebar etc.
export function CandidateCardCompact({ candidate, className }: CandidateCardProps) {
  const { name, slug, office, state, photoUrl, party, score } = candidate;
  return (
    <Link
      href={`/candidato/${slug}`}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-all hover:border-border-strong hover:shadow-sm",
        className,
      )}
    >
      <CandidateAvatar name={name} photoUrl={photoUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">{name}</p>
        <p className="text-xs text-muted-foreground">{party?.acronym} · {OFFICE_LABELS[office] ?? office}{state && ` · ${state}`}</p>
      </div>
      <span className="text-sm font-bold tabular-nums text-foreground">{score?.overall.toFixed(1) ?? "—"}</span>
    </Link>
  );
}

interface AvatarProps {
  name: string;
  photoUrl: string | null;
  size?: "sm" | "md" | "lg";
}

function CandidateAvatar({ name, photoUrl, size = "md" }: AvatarProps) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-xl" };
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  if (photoUrl) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden rounded-full", sizes[size])}>
        <Image src={photoUrl} alt={name} fill className="object-cover" sizes="64px" />
      </div>
    );
  }

  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary", sizes[size])}>
      {initials}
    </div>
  );
}

// Re-export ScoreBar usage for profile page
export { ScoreBar, Badge };
export { SCORE_LABELS_FULL } from "@/lib/content/labels";
