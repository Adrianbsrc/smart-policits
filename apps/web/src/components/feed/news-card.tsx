import { ExternalLink, Newspaper } from "lucide-react";
import type { FeedItem } from "@/lib/api/types";

interface Props {
  item: FeedItem;
}

export function NewsCard({ item }: Props) {
  const source = item.metadata.source as string | undefined;
  const tags = item.metadata.tags as string[] | undefined;
  const url = item.metadata.url as string | undefined;
  const date = new Date(item.publishedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group relative flex h-full flex-col overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f1f3d 50%, #1a1040 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Top label */}
      <div className="relative z-10 flex items-center gap-2 p-4 sm:p-5">
        <div className="flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1.5 backdrop-blur-sm">
          <Newspaper className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-300">Notícia</span>
        </div>
        {source && (
          <span className="ml-auto text-xs text-white/50">{source}</span>
        )}
      </div>

      <div className="relative z-10 flex-1" />

      {/* Bottom glass panel */}
      <div className="relative z-10">
        <div className="absolute inset-0 backdrop-blur-xl" style={{ background: "rgba(0,0,0,0.50)" }} />
        <div className="relative p-4 sm:p-5">
          <p className="text-xs text-white/50">{date}</p>
          <h2 className="mt-1.5 line-clamp-3 text-base font-bold leading-snug text-white sm:text-lg">
            {item.title}
          </h2>
          {item.summary && (
            <p className="mt-2 line-clamp-2 text-sm text-white/70">{item.summary}</p>
          )}

          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {(url ?? item.ctaUrl) && (
            <a
              href={url ?? item.ctaUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 py-2.5 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/20"
            >
              {item.ctaLabel ?? "Ler mais"}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
