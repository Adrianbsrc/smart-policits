"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, ShieldX, TrendingUp, TrendingDown } from "lucide-react";
import type { FeedItem } from "@/lib/api/types";
import { OFFICE_LABELS } from "@/lib/content/labels";

interface Props {
  item: FeedItem;
}

function IntegrityIcon({ multiplier }: { multiplier?: number }) {
  if (multiplier == null || multiplier >= 1) return <ShieldCheck className="h-4 w-4 text-green-400" />;
  if (multiplier >= 0.7) return <ShieldAlert className="h-4 w-4 text-yellow-400" />;
  return <ShieldX className="h-4 w-4 text-red-400" />;
}

function ScoreArc({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));
  const color = score >= 7 ? "#22c55e" : score >= 5 ? "#eab308" : "#ef4444";
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={r} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="relative text-sm font-bold text-white tabular-nums">{score.toFixed(1)}</span>
    </div>
  );
}

export function PoliticianSpotlightCard({ item }: Props) {
  const { metadata, politician } = item;
  const overall = (metadata.overall as number) ?? 0;
  const multiplier = metadata.integrityMultiplier as number | undefined;
  const partyHex = metadata.partyColorHex as string | null;
  const officeKey = metadata.office as string ?? "";
  const office = OFFICE_LABELS[officeKey as keyof typeof OFFICE_LABELS] ?? officeKey;
  const parts = (item.summary ?? "").split(" · ");
  const state = parts[1] ?? "";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        {politician?.photoUrl ? (
          <Image
            src={politician.photoUrl}
            alt={politician.name ?? ""}
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 600px"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${partyHex ?? "#1d4ed8"}44 0%, ${partyHex ?? "#7c3aed"}22 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
      </div>

      {/* Top bar: party + integrity */}
      <div className="relative z-10 flex items-start justify-between p-4 sm:p-5">
        {partyHex && metadata.partyAcronym ? (
          <span
            className="rounded-md px-2.5 py-1 text-xs font-bold text-white shadow-lg"
            style={{ backgroundColor: partyHex }}
          >
            {metadata.partyAcronym as string}
          </span>
        ) : <div />}
        <IntegrityIcon multiplier={multiplier} />
      </div>

      {/* Spacer pushes content down */}
      <div className="relative z-10 flex-1" />

      {/* Bottom glass panel */}
      <div className="relative z-10">
        <div className="absolute inset-0 backdrop-blur-xl" style={{ background: "rgba(0,0,0,0.45)" }} />
        <div className="relative p-4 sm:p-5">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">
                {office}{state ? ` · ${state}` : ""}
              </p>
              <h2 className="mt-0.5 line-clamp-2 text-lg font-bold leading-tight text-white">
                {politician?.name ?? item.title}
              </h2>
            </div>
            <ScoreArc score={overall} />
          </div>

          {(metadata.topDimension || metadata.worstDimension) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {metadata.topDimension && (
                <div className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-2.5 py-1">
                  <TrendingUp className="h-3 w-3 shrink-0 text-green-400" />
                  <span className="text-xs text-green-300">{metadata.topDimension as string}</span>
                </div>
              )}
              {metadata.worstDimension && (
                <div className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-1">
                  <TrendingDown className="h-3 w-3 shrink-0 text-red-400" />
                  <span className="text-xs text-red-300">{metadata.worstDimension as string}</span>
                </div>
              )}
            </div>
          )}

          {item.ctaUrl && (
            <Link
              href={item.ctaUrl}
              className="mt-4 flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 py-2.5 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/20"
            >
              {item.ctaLabel ?? "Ver perfil"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
