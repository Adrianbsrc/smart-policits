"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Share2, Check, ArrowRight, Plus, Users } from "lucide-react";

import { candidatesService } from "@/lib/api/services";
import { useDebounce } from "@/hooks/use-debounce";
import { OFFICE_LABELS, SCORE_LABELS_FULL, SCORE_MAIN_KEYS, SCORE_EXTENDED_KEYS } from "@/lib/content/labels";
import { FollowButton } from "@/components/candidates/follow-button";
import type { CandidateDetail, CandidateScore } from "@/lib/api/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_SLOTS = 4;
const MIN_SLOTS = 2;
const SLOT_PARAMS = ["a", "b", "c", "d"] as const;
const SLOT_LABELS = ["Perfil A", "Perfil B", "Perfil C", "Perfil D"] as const;

/** One distinct colour per comparison slot */
const SLOT_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"] as const;

type Slots = [
  CandidateDetail | null,
  CandidateDetail | null,
  CandidateDetail | null,
  CandidateDetail | null,
];

const EMPTY_SLOTS: Slots = [null, null, null, null];

// ─── Candidate search box ────────────────────────────────────────────────────

interface SearchBoxProps {
  label: string;
  color: string;
  selected: CandidateDetail | null;
  onSelect: (c: CandidateDetail | null) => void;
  /** Slots 3+ can be removed entirely */
  onRemoveSlot?: () => void;
}

function CandidateSearchBox({ label, color, selected, onSelect, onRemoveSlot }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);
  const containerRef      = useRef<HTMLDivElement>(null);
  const debouncedQuery    = useDebounce(query, 300);

  const { data, isFetching } = useQuery({
    queryKey: ["compare-search", debouncedQuery],
    queryFn: () => candidatesService.list({ search: debouncedQuery, limit: 6 }),
    enabled:   debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
  });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSelect(slug: string) {
    setOpen(false);
    setQuery("");
    const detail = await candidatesService.detail(slug);
    onSelect(detail);
  }

  if (selected) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl border-2 bg-background p-4"
        style={{ borderColor: `${color}55` }}
      >
        <div
          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {selected.photoUrl ? (
            <Image src={selected.photoUrl} alt={selected.name} fill className="object-cover" sizes="48px" />
          ) : (
            <span>{selected.name[0]}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{selected.name}</p>
          <p className="text-xs text-muted-foreground">
            {selected.party?.acronym ?? "—"} · {OFFICE_LABELS[selected.office] ?? selected.office}
            {selected.state ? ` · ${selected.state}` : ""}
          </p>
        </div>
        <button
          onClick={() => onSelect(null)}
          aria-label="Remover perfil"
          className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {onRemoveSlot && (
          <button
            onClick={onRemoveSlot}
            aria-label="Remover slot"
            className="rounded-full p-1 text-muted-foreground/60 hover:bg-muted hover:text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => debouncedQuery.trim().length >= 2 && setOpen(true)}
          placeholder="Buscar político..."
          autoComplete="off"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        {isFetching && (
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </div>

      {open && debouncedQuery.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          {data?.data.map((c) => (
            <button
              key={c.id}
              onMouseDown={(e) => { e.preventDefault(); void handleSelect(c.slug); }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary">
                {c.photoUrl ? (
                  <Image src={c.photoUrl} alt={c.name} fill className="object-cover" sizes="32px" />
                ) : (
                  <span>{c.name[0]}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.party?.acronym ?? "—"} · {OFFICE_LABELS[c.office] ?? c.office}
                  {c.state ? ` · ${c.state}` : ""}
                </p>
              </div>
              {c.party && (
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: c.party.colorHex }}
                >
                  {c.party.acronym}
                </span>
              )}
            </button>
          ))}
          {data?.data.length === 0 && !isFetching && (
            <p className="px-4 py-3 text-sm text-muted-foreground">Nenhum político encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Score row (N candidates) ─────────────────────────────────────────────────

const ALL_SCORE_KEYS = [...SCORE_MAIN_KEYS, ...SCORE_EXTENDED_KEYS] as const;
type ScoreKey = (typeof ALL_SCORE_KEYS)[number];

function ScoreRow({
  label,
  values,
}: {
  label: string;
  values: Array<{ value: number | null; color: string }>;
}) {
  const maxVal  = Math.max(...values.map((v) => v.value ?? 0), 0.001);
  const topVal  = Math.max(...values.map((v) => v.value ?? 0));

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="space-y-1.5">
        {values.map(({ value, color }, i) => {
          const pct      = ((value ?? 0) / maxVal) * 100;
          const isLeader = value !== null && value > 0 && value === topVal;
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                aria-hidden
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span
                className={`w-8 shrink-0 text-right text-xs tabular-nums ${
                  isLeader ? "font-semibold text-foreground" : "text-muted-foreground"
                }`}
              >
                {value?.toFixed(1) ?? "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Comparison panel ─────────────────────────────────────────────────────────

function ComparisonPanel({
  candidates,
  colors,
}: {
  candidates: CandidateDetail[];
  colors: string[];
}) {
  const [copied, setCopied] = useState(false);

  const winner = candidates.reduce<CandidateDetail | null>((best, c) => {
    if (!c.score) return best;
    if (!best?.score) return c;
    return c.score.overall > best.score.overall ? c : best;
  }, null);

  const gridClass =
    candidates.length === 2
      ? "grid-cols-2"
      : candidates.length === 3
        ? "grid-cols-3"
        : "grid-cols-2 sm:grid-cols-4";

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const names = candidates.map((c) => c.name).join(", ");
    if (navigator.share) {
      void navigator.share({ title: `${names} — Smart Politics`, text: `Compare políticos no Smart Politics!\n${url}`, url });
    } else {
      void navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  function handleWhatsApp() {
    const url  = typeof window !== "undefined" ? window.location.href : "";
    const text = `Compare políticos no Smart Politics!\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  const scoreValues = (key: ScoreKey) =>
    candidates.map((c, i) => ({
      value: c.score ? (c.score[key as keyof CandidateScore] as number) : null,
      color: colors[i] ?? SLOT_COLORS[i] ?? SLOT_COLORS[0],
    }));

  return (
    <div className="mt-8 rounded-2xl border border-border bg-background p-6 shadow-sm">
      {/* Candidate cards */}
      <div className={`mb-8 grid gap-3 ${gridClass}`}>
        {candidates.map((c, i) => (
          <div
            key={c.id}
            className="relative rounded-xl border-2 bg-background p-4 text-center"
            style={{ borderColor: `${colors[i]}44` }}
          >
            {/* Slot badge */}
            <span
              className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: colors[i] }}
            >
              {String.fromCharCode(65 + i)}
            </span>

            <div
              className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: colors[i] }}
            >
              {c.photoUrl ? (
                <Image src={c.photoUrl} alt={c.name} fill className="object-cover" sizes="56px" />
              ) : (
                <span>{c.name[0]}</span>
              )}
            </div>
            <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {c.party?.acronym ?? "—"} · {OFFICE_LABELS[c.office] ?? c.office}
            </p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span
                className="text-xl font-bold tabular-nums"
                style={{ color: c === winner ? colors[i] : undefined }}
              >
                {c.score?.overall.toFixed(1) ?? "—"}
              </span>
              <span className="text-xs text-muted-foreground">/10</span>
            </div>
            {c === winner && (
              <span
                className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: colors[i] }}
              >
                Maior score
              </span>
            )}
            <div className="mt-3 flex flex-col items-center gap-2">
              <FollowButton
                candidateId={c.id}
                variant="full"
                className="w-full justify-center text-xs h-8 px-3"
              />
              <Link
                href={`/candidato/${c.slug}`}
                className="flex items-center justify-center gap-1 text-xs hover:underline"
                style={{ color: colors[i] }}
              >
                Ver perfil
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Legend (for 3-4 candidates, show name-to-letter mapping) */}
      {candidates.length > 2 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {candidates.map((c, i) => (
            <div key={c.id} className="flex items-center gap-1.5">
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ backgroundColor: colors[i] }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-xs text-muted-foreground">{c.name.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Score dimensions */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Dimensões principais</h3>
        {SCORE_MAIN_KEYS.map((key) => (
          <ScoreRow key={key} label={SCORE_LABELS_FULL[key]} values={scoreValues(key)} />
        ))}
        <h3 className="mt-6 border-t border-border pt-5 text-sm font-semibold text-foreground">
          Dimensões estendidas
        </h3>
        {SCORE_EXTENDED_KEYS.map((key) => (
          <ScoreRow key={key} label={SCORE_LABELS_FULL[key]} values={scoreValues(key)} />
        ))}
      </div>

      {/* Share */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          {copied ? (
            <><Check className="h-4 w-4 text-success" />Link copiado!</>
          ) : (
            <><Share2 className="h-4 w-4" />Compartilhar</>
          )}
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Enviar via WhatsApp
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CandidateComparisonClient() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [slots,       setSlots]       = useState<Slots>([...EMPTY_SLOTS]);
  const [visibleCount, setVisibleCount] = useState(MIN_SLOTS);

  // Load from URL on mount
  useEffect(() => {
    async function loadFromParams() {
      const fetches = SLOT_PARAMS.map((p) => {
        const slug = searchParams.get(p);
        return slug ? candidatesService.detail(slug).catch(() => null) : Promise.resolve(null);
      });
      const results = await Promise.all(fetches);
      const loaded = results as Slots;
      setSlots(loaded);
      const filledCount = loaded.filter(Boolean).length;
      setVisibleCount(Math.max(MIN_SLOTS, filledCount));
    }
    void loadFromParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL when slots change
  useEffect(() => {
    const params = new URLSearchParams();
    slots.slice(0, visibleCount).forEach((c, i) => {
      const param = SLOT_PARAMS[i];
      if (c && param) params.set(param, c.slug);
    });
    const qs = params.toString();
    router.replace(qs ? `/comparar?${qs}` : "/comparar", { scroll: false });
  }, [slots, visibleCount, router]);

  function setSlot(index: number, candidate: CandidateDetail | null) {
    setSlots((prev) => {
      const next = [...prev] as Slots;
      next[index] = candidate;
      return next;
    });
  }

  function addSlot() {
    if (visibleCount >= MAX_SLOTS) return;
    setVisibleCount((v) => v + 1);
  }

  function removeSlot(index: number) {
    setSlots((prev) => {
      const next = [...prev] as Slots;
      next.splice(index, 1);
      next.push(null);
      return next as Slots;
    });
    setVisibleCount((v) => Math.max(MIN_SLOTS, v - 1));
  }

  const activeCandidates = slots.slice(0, visibleCount).filter(Boolean) as CandidateDetail[];
  const canCompare       = activeCandidates.length >= MIN_SLOTS;

  const slotColors = Array.from({ length: visibleCount }, (_, i) => SLOT_COLORS[i] ?? SLOT_COLORS[0]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Comparar Políticos
        </h1>
        <p className="mt-3 text-muted-foreground">
          Selecione de 2 a 4 políticos para ver uma comparação detalhada de scores por dimensão.
        </p>
      </div>

      {/* Search boxes */}
      <div
        className={`grid gap-4 ${
          visibleCount === 1 ? "grid-cols-1" :
          visibleCount === 2 ? "grid-cols-1 sm:grid-cols-2" :
          visibleCount === 3 ? "grid-cols-1 sm:grid-cols-3" :
          "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {Array.from({ length: visibleCount }, (_, i) => (
          <CandidateSearchBox
            key={i}
            label={SLOT_LABELS[i] ?? `Perfil ${String.fromCharCode(65 + i)}`}
            color={slotColors[i] ?? SLOT_COLORS[0]}
            selected={slots[i] ?? null}
            onSelect={(c) => setSlot(i, c)}
            onRemoveSlot={i >= MIN_SLOTS ? () => removeSlot(i) : undefined}
          />
        ))}
      </div>

      {/* Add another slot */}
      {visibleCount < MAX_SLOTS && (
        <button
          onClick={addSlot}
          className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Adicionar político para comparação
        </button>
      )}

      {/* Empty state */}
      {!canCompare && (
        <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {activeCandidates.length === 0
              ? "Selecione ao menos dois políticos para iniciar a comparação."
              : "Selecione mais um político para comparar."}
          </p>
        </div>
      )}

      {canCompare && (
        <ComparisonPanel
          candidates={activeCandidates}
          colors={slotColors.slice(0, activeCandidates.length)}
        />
      )}
    </div>
  );
}
