"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { FollowButton } from "@/components/politicians/follow-button";
import { useFollows } from "@/hooks/use-follows";
import { OFFICE_LABELS } from "@/lib/content/labels";

export default function FavoritosPage() {
  const { data: follows = [], isLoading } = useFollows();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = follows.length === 0;
  const office = (key: string) => OFFICE_LABELS[key as keyof typeof OFFICE_LABELS] ?? key;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Favoritos</h1>
          <p className="mt-1 text-muted-foreground">
            {isEmpty
              ? "Você ainda não segue nenhum político."
              : `${follows.length} político${follows.length > 1 ? "s" : ""} acompanhado${follows.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/ranking"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Explorar políticos
        </Link>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="Nenhum favorito ainda"
          description="Explore o ranking e siga os políticos que mais te interessam."
          action={
            <Link
              href="/ranking"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Ver ranking
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {follows.map((f) => (
            <Link
              key={f.id}
              href={`/perfil/${f.politician.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-border-strong hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {f.politician.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {f.politician.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {f.politician.party?.acronym ?? "—"} · {office(f.politician.office)}
                  {f.politician.state ? ` · ${f.politician.state}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {f.politician.score ? (
                  <>
                    <p className="text-xl font-bold tabular-nums text-foreground">
                      {f.politician.score.overall.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">/ 10</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">sem nota</p>
                )}
              </div>
              <FollowButton candidateId={f.politician.id} variant="icon" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
