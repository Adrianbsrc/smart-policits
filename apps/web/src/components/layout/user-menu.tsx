"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Heart, Settings, LogOut, ChevronDown } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes";
import type { User } from "@supabase/supabase-js";

interface UserMenuProps {
  user: User;
}

const menuItems = [
  { href: Routes.dashboard(), label: "Dashboard", icon: LayoutDashboard },
  { href: Routes.favoritos(), label: "Favoritos", icon: Heart },
  { href: Routes.configuracoes(), label: "Configurações", icon: Settings },
] as const;

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const displayName = user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Usuário";
  const initial = displayName[0]?.toUpperCase() ?? "U";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(Routes.home());
    router.refresh();
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initial}
        </span>
        <span className="hidden max-w-[120px] truncate font-medium text-foreground md:block">
          {displayName}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-scale-in absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-background-raised shadow-lg"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="py-1">
            {menuItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Link>
            ))}
          </div>
          <div className="border-t border-border py-1">
            <button
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
