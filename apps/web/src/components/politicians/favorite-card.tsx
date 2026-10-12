import Link from "next/link";
import { PoliticianAvatar } from "@/components/politicians/politician-avatar";
import { FollowButton } from "@/components/politicians/follow-button";
import { ScoreRing } from "@/components/ui/score-ring";
import { GlassCard } from "@/components/ui/glass-card";
import { OFFICE_LABELS } from "@/lib/content/labels";
import type { FollowedPolitician } from "@/lib/api/types";
import { Routes } from "@/routes";

interface FavoriteCardProps {
  follow: FollowedPolitician;
}

export function FavoriteCard({ follow: f }: FavoriteCardProps) {
  const isMock  = !f.politician.score || f.politician.score.scoreType === "mock";
  const overall = isMock ? null : f.politician.score!.overall;

  return (
    <GlassCard
      noPadding
      className="flex items-center gap-3 px-4 py-3.5 transition-all hover:shadow-md"
    >
      <PoliticianAvatar name={f.politician.name} photoUrl={f.politician.photoUrl} size="md" />

      <div className="min-w-0 flex-1">
        <Link
          href={Routes.legacyPoliticianProfile(f.politician.slug)}
          className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          {f.politician.name}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {f.politician.party?.acronym && `${f.politician.party.acronym} · `}
          {OFFICE_LABELS[f.politician.office] ?? f.politician.office}
          {f.politician.state && ` · ${f.politician.state}`}
        </p>
      </div>

      <ScoreRing value={overall} size={44} stroke={4} />

      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <Link
          href={Routes.legacyPoliticianProfile(f.politician.slug)}
          className="inline-flex h-7 items-center rounded-lg border border-border px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Ver perfil
        </Link>
        <FollowButton candidateId={f.politician.id} variant="icon" />
      </div>
    </GlassCard>
  );
}
