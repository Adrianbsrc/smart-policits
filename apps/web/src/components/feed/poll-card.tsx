import { BarChart3, Users } from "lucide-react";
import type { FeedItem } from "@/lib/api/types";

interface Props {
  item: FeedItem;
}

export function PollCard({ item }: Props) {
  const { metadata } = item;
  const options = (metadata.options as { label: string; votes: number }[] | undefined) ?? [];
  const totalVotes = (metadata.totalVotes as number) ?? options.reduce((s, o) => s + o.votes, 0);
  const maxVotes = Math.max(...options.map((o) => o.votes), 1);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {/* Top label */}
      <div className="relative z-10 flex items-center gap-2 p-4 sm:p-5">
        <div className="flex items-center gap-2 rounded-full bg-cyan-500/20 px-3 py-1.5 backdrop-blur-sm">
          <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-300">Enquete</span>
        </div>
      </div>

      <div className="relative z-10 flex-1" />

      {/* Bottom glass panel */}
      <div className="relative z-10">
        <div className="absolute inset-0 backdrop-blur-xl" style={{ background: "rgba(0,0,0,0.52)" }} />
        <div className="relative p-4 sm:p-5">
          <h2 className="line-clamp-2 text-base font-bold leading-snug text-white sm:text-lg">{item.title}</h2>

          {options.length > 0 && (
            <div className="mt-4 space-y-2.5">
              {options.map((opt) => {
                const pct = Math.round((opt.votes / totalVotes) * 100);
                const barWidth = Math.round((opt.votes / maxVotes) * 100);
                const isWinner = opt.votes === maxVotes;
                return (
                  <div key={opt.label}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className={`text-xs ${isWinner ? "font-semibold text-white" : "text-white/70"}`}>
                        {opt.label}
                      </span>
                      <span className={`text-xs font-bold tabular-nums ${isWinner ? "text-cyan-300" : "text-white/50"}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-full bg-white/10" style={{ height: 5 }}>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isWinner ? "bg-cyan-400" : "bg-white/40"}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-3 flex items-center gap-1 text-xs text-white/40">
            <Users className="h-3 w-3" />
            {totalVotes.toLocaleString("pt-BR")} votos
          </div>
        </div>
      </div>
    </article>
  );
}
