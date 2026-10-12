"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, LogIn } from "lucide-react";

import { useIsAuthenticated } from "@/hooks/use-session";
import { useFollow, useFollowStatus, useUnfollow } from "@/hooks/use-follows";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes";

interface FollowButtonProps {
  candidateId: string;
  variant?: "icon" | "full";
  className?: string;
}

export function FollowButton({ candidateId, variant = "full", className }: FollowButtonProps) {
  const isAuthenticated = useIsAuthenticated();
  const [authPrompt, setAuthPrompt] = useState(false);
  const { data: status, isLoading: checking } = useFollowStatus(candidateId, isAuthenticated === true);
  const { mutate: follow, isPending: following } = useFollow();
  const { mutate: unfollow, isPending: unfollowing } = useUnfollow();

  const isFollowing = status?.following ?? false;
  const isPending = following || unfollowing || checking;

  if (isAuthenticated === false) {
    if (variant === "icon") {
      return (
        <div className="relative">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAuthPrompt((v) => !v); }}
            aria-label="Entrar para seguir"
            className={cn(
              "rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted",
              className,
            )}
          >
            <Heart className="h-4 w-4" />
          </button>
          {authPrompt && (
            <AuthPromptTooltip onClose={() => setAuthPrompt(false)} />
          )}
        </div>
      );
    }
    return (
      <Link
        href={Routes.login()}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted",
          className,
        )}
      >
        <Heart className="h-4 w-4" />
        Seguir
      </Link>
    );
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isFollowing) {
      unfollow(candidateId);
    } else {
      follow(candidateId);
    }
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending || isAuthenticated === null}
        aria-label={isFollowing ? "Deixar de seguir" : "Seguir político"}
        className={cn(
          "rounded-md p-2 transition-colors",
          isFollowing
            ? "text-destructive hover:bg-destructive/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          className,
        )}
      >
        <Heart className={cn("h-4 w-4", isFollowing && "fill-current")} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || isAuthenticated === null}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold transition-all",
        isFollowing
          ? "border border-border text-foreground hover:bg-muted"
          : "bg-primary text-primary-foreground hover:bg-primary/90",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", isFollowing && "fill-current")} />
      {isFollowing ? "Seguindo" : "Seguir"}
    </button>
  );
}

function AuthPromptTooltip({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-label="Login necessário"
      className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-background p-4 shadow-lg"
    >
      <p className="mb-3 text-sm text-foreground">Faça login para seguir políticos.</p>
      <div className="flex gap-2">
        <Link
          href={Routes.login()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <LogIn className="h-3.5 w-3.5" />
          Entrar
        </Link>
        <button
          onClick={onClose}
          className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
