import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PoliticianAvatarProps {
  name: string;
  photoUrl: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Aplica anel dourado (top 3) */
  ring?: boolean;
  className?: string;
}

// ─── Size map ────────────────────────────────────────────────────────────────

const SIZE_MAP = {
  xs: { container: "h-7 w-7",   text: "text-[10px]", px: 28  },
  sm: { container: "h-9 w-9",   text: "text-xs",     px: 36  },
  md: { container: "h-11 w-11", text: "text-sm",     px: 44  },
  lg: { container: "h-16 w-16", text: "text-xl",     px: 64  },
  xl: { container: "h-24 w-24", text: "text-3xl",    px: 96  },
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Avatar do político com duas variantes:
 *   1. Foto real (next/image com object-cover)
 *   2. Fallback com iniciais (mantém vibe Liquid Civic, não substitui foto)
 *
 * Regra: a foto é sempre preferida quando disponível.
 * O fallback de iniciais é exibido apenas quando photoUrl é null/undefined.
 */
export function PoliticianAvatar({
  name,
  photoUrl,
  size = "md",
  ring = false,
  className,
}: PoliticianAvatarProps) {
  const { container, text, px } = SIZE_MAP[size];

  return (
    <div className={cn("relative shrink-0", className)}>
      {/* Anel dourado para top 3 */}
      {ring && (
        <div
          className="absolute inset-[-3px] rounded-full border-[1.5px] border-gold"
          aria-hidden
        />
      )}

      {photoUrl ? (
        <div className={cn("relative overflow-hidden rounded-full", container)}>
          <Image
            src={photoUrl}
            alt={name}
            fill
            sizes={`${px}px`}
            className="object-cover"
          />
        </div>
      ) : (
        /* Fallback com iniciais — estilo Liquid Civic */
        <InitialsAvatar name={name} size={size} />
      )}
    </div>
  );
}

// ─── Variante pública de iniciais ─────────────────────────────────────────────

interface InitialsAvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Variante de iniciais exposta separadamente para uso onde a foto
 * não é desejada (ex: lista compacta, placeholders de carregamento).
 */
export function InitialsAvatar({ name, size = "md", className }: InitialsAvatarProps) {
  const { container, text } = SIZE_MAP[size];
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary",
        "shadow-[inset_0_-4px_12px_rgba(0,0,0,.12),inset_0_4px_12px_rgba(255,255,255,.3)]",
        container,
        text,
        className,
      )}
      aria-label={`Iniciais de ${name}`}
    >
      {initials}
    </div>
  );
}
