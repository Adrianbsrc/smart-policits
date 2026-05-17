import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { FeedItem } from "@/lib/api/types";

interface Props {
  item: FeedItem;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function GenericCard({ item }: Props) {
  const { metadata } = item;
  const color = (metadata.color as string | undefined) ?? "#3b82f6";
  const tags = metadata.tags as string[] | undefined;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden">
      {/* Gradient background using accent color */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(color, 0.3)} 0%, ${hexToRgba(color, 0.1)} 50%, rgba(0,0,0,0.8) 100%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #111218 100%)",
          zIndex: -1,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Decorative circle */}
      <div
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20 transition-transform duration-700 group-hover:scale-110"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      />

      {/* Top label */}
      <div className="relative z-10 flex items-center gap-2 p-4 sm:p-5">
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm"
          style={{ background: hexToRgba(color, 0.2) }}
        >
          <Sparkles className="h-3.5 w-3.5" style={{ color }} />
          <span className="text-xs font-semibold" style={{ color }}>Destaque</span>
        </div>
      </div>

      <div className="relative z-10 flex-1" />

      {/* Bottom glass panel */}
      <div className="relative z-10">
        <div className="absolute inset-0 backdrop-blur-xl" style={{ background: "rgba(0,0,0,0.50)" }} />
        <div className="relative p-4 sm:p-5">
          <h2 className="line-clamp-2 text-base font-bold leading-snug text-white sm:text-lg">{item.title}</h2>
          {item.summary && (
            <p className="mt-2 line-clamp-2 text-sm text-white/70">{item.summary}</p>
          )}

          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2 py-0.5 text-xs text-white/70"
                  style={{ background: hexToRgba(color, 0.15) }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {item.ctaUrl && (
            <Link
              href={item.ctaUrl}
              className="mt-4 flex w-full items-center justify-center rounded-xl border py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              style={{ borderColor: hexToRgba(color, 0.4), background: hexToRgba(color, 0.1) }}
            >
              {item.ctaLabel ?? "Saiba mais"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
