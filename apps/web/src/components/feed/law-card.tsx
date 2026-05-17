import { Scale, ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import type { FeedItem } from "@/lib/api/types";

interface Props {
  item: FeedItem;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  approved: { label: "Aprovado", color: "text-green-300", bg: "bg-green-500/20" },
  rejected: { label: "Rejeitado", color: "text-red-300", bg: "bg-red-500/20" },
  pending: { label: "Em votação", color: "text-yellow-300", bg: "bg-yellow-500/20" },
};

export function LawCard({ item }: Props) {
  const { metadata } = item;
  const votesFor = (metadata.votesFor as number) ?? 0;
  const votesAgainst = (metadata.votesAgainst as number) ?? 0;
  const totalVotes = (metadata.totalVotes as number) ?? 1;
  const status = (metadata.status as string) ?? "pending";
  const billId = metadata.billId as string | undefined;
  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS["pending"]!;
  const forPct = Math.round((votesFor / totalVotes) * 100);
  const againstPct = Math.round((votesAgainst / totalVotes) * 100);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #1c1f26 0%, #12151c 50%, #0e1118 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {/* Top label */}
      <div className="relative z-10 flex items-center gap-2 p-4 sm:p-5">
        <div className="flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1.5 backdrop-blur-sm">
          <Scale className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-xs font-semibold text-purple-300">Votação legislativa</span>
        </div>
        {billId && (
          <span className="ml-auto rounded bg-white/10 px-2 py-0.5 text-xs font-mono text-white/50">{billId}</span>
        )}
      </div>

      <div className="relative z-10 flex-1" />

      {/* Bottom glass panel */}
      <div className="relative z-10">
        <div className="absolute inset-0 backdrop-blur-xl" style={{ background: "rgba(0,0,0,0.55)" }} />
        <div className="relative p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="line-clamp-2 text-base font-bold leading-snug text-white sm:text-lg">
              {item.title}
            </h2>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {item.summary && (
            <p className="mt-2 line-clamp-2 text-sm text-white/60">{item.summary}</p>
          )}

          {/* Vote bar */}
          <div className="mt-4 space-y-2">
            <div className="overflow-hidden rounded-full bg-white/10" style={{ height: 6 }}>
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-700"
                style={{ width: `${forPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3 text-green-400" />
                {votesFor} votos ({forPct}%)
              </span>
              <span className="flex items-center gap-1">
                {votesAgainst} votos ({againstPct}%)
                <ThumbsDown className="h-3 w-3 text-red-400" />
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1 text-xs text-white/40">
            <Clock className="h-3 w-3" />
            {new Date(item.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>
    </article>
  );
}
