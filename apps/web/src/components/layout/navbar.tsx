"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AlertsBell } from "@/components/layout/alerts-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes";

// ─── Nav items ──────────────────────────────────────────────────────────────

const PUBLIC_NAV = [
  { href: Routes.ranking(),     label: "Ranking",     featured: false },
  { href: Routes.feed(),        label: "Feed",        featured: true  }, // destaque com pulse dot
  { href: Routes.compare(),     label: "Comparar",    featured: false },
  { href: Routes.quiz(),        label: "Quiz",        featured: false },
  { href: Routes.methodology(), label: "Metodologia", featured: false },
] as const;

const AUTH_NAV = [
  { href: Routes.favoritos(), label: "Favoritos", featured: false },
] as const;

// ─── Logo mark ──────────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-primary to-secondary">
      {/* Recorte interior */}
      <div className="absolute inset-[4px] rounded-[5px] bg-background" />
      <span className="relative text-[13px] font-extrabold text-primary">★</span>
    </div>
  );
}

// ─── Feed pulse dot ──────────────────────────────────────────────────────────

function PulseDot({ invert }: { invert?: boolean }) {
  return (
    <span className="relative inline-flex h-2 w-2 shrink-0">
      <span
        className={cn(
          "animate-pulse-dot absolute inset-0 rounded-full",
          invert ? "bg-white" : "bg-primary",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "absolute inset-[2px] rounded-full",
          invert ? "bg-white" : "bg-primary",
        )}
        aria-hidden
      />
    </span>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const allNav = user ? [...PUBLIC_NAV, ...AUTH_NAV] : PUBLIC_NAV;

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-3 sm:px-6 lg:px-8">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-screen-xl items-center justify-between gap-4 rounded-[18px] px-3 pl-4",
          "glass-strong",
        )}
      >
        {/* Logo */}
        <Link href={Routes.home()} className="flex shrink-0 items-center gap-2.5 text-foreground">
          <LogoMark />
          <span className="hidden font-display text-base font-bold tracking-tight sm:block">
            Smart Politics
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {allNav.map(({ href, label, featured }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");

            if (featured) {
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-[7px] text-[13px] font-bold transition-all duration-150",
                    isActive
                      ? "border-primary bg-primary text-white"
                      : "border-primary/22 bg-primary/10 text-primary hover:bg-primary/15",
                  )}
                >
                  <PulseDot invert={isActive} />
                  {label}
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-xl px-3.5 py-[7px] text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Buscar"
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          <ThemeToggle />

          {!loading && (
            <>
              {user ? (
                <>
                  <AlertsBell />
                  <UserMenu user={user} />
                </>
              ) : (
                <div className="hidden items-center gap-1.5 md:flex">
                  <Link
                    href={Routes.login()}
                    className="rounded-xl px-3.5 py-[7px] text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Entrar
                  </Link>
                  <Link
                    href={Routes.quiz()}
                    className={cn(
                      "inline-flex h-8 items-center justify-center rounded-xl bg-primary px-4",
                      "text-[12.5px] font-semibold text-white transition-all hover:bg-primary-hover active:scale-[0.97]",
                    )}
                  >
                    Fazer Quiz
                  </Link>
                </div>
              )}
            </>
          )}

          <MobileMenu isLoggedIn={!!user} />
        </div>
      </div>
    </header>
  );
}
