"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Share2, Check, ArrowRight, Plus, Users, ShieldCheck } from "lucide-react";

import { politiciansService } from "@/lib/api/services";
import { useDebounce } from "@/hooks/use-debounce";
import { OFFICE_LABELS, SCORE_LABELS_FULL, SCORE_MAIN_KEYS, SCORE_EXTENDED_KEYS } from "@/lib/content/labels";
import { FollowButton } from "@/components/politicians/follow-button";
import type { PoliticianDetail, PoliticianScore, ScoreBreakdown } from "@/lib/api/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SLOTS = 4;
const MIN_SLOTS = 2;
const SLOT_PARAMS = ["a", "b", "c", "d"] as const;
const SLOT_LABELS = ["Perfil A", "Perfil B", "Perfil C", "Perfil D"] as const;

const SLOT_COLORS = ["#2e7d5b", "#2563eb", "#f59e0b", "#8b5cf6"] as const;

type Slots = [
  PoliticianDetail | null,
  PoliticianDetail | null,
  PoliticianDetail | null,
  PoliticianDetail | null,
];

const EMPTY_SLOTS: Slots = [null, null, null, null];

// ─── Pillars ──────────────────────────────────────────────────────────────────

const PILLARS = [
  { key: "transparency", label: "Transparência", bdKey: "transparency" as keyof ScoreBreakdown },
  { key: "activity",     label: "Presença",      bdKey: "activity"     as keyof ScoreBreakdown },
  { key: "constitutional", label: "Coerência",   bdKey: "constitutional" as keyof ScoreBreakdown },
  { key: "integrity",    label: "Integridade",   bdKey: null },
  { key: "thematic",     label: "Produtividade", bdKey: "thematic"     as keyof ScoreBreakdown },
] as const;

function getPillarValue(score: PoliticianScore, pillarKey: string): number | null {
  if (score.scoreType === "mock") return null;
  if (pillarKey === "integrity") {
    return score.integrityMultiplier * 10;
  }
  const bd = score.breakdown;
  if (!bd) return null;
  return (bd[pillarKey as keyof ScoreBreakdown] as number | undefined) ?? null;
}

function getScoreValue(score: PoliticianScore | null, key: keyof PoliticianScore): number | null {
  if (!score) return null;
  if (score.scoreType === "mock") return null;
  const val = score[key];
  return typeof val === "number" ? val : null;
}

// ─── Politician search box ────────────────────────────────────────────────────

interface SearchBoxProps {
  label: string;
  color: string;
  selected: PoliticianDetail | null;
  onSelect: (c: PoliticianDetail | null) => void;
  onRemoveSlot?: () => void;
}

function PoliticianSearchBox({ label, color, selected, onSelect, onRemoveSlot }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);
  const containerRef      = useRef<HTMLDivElement>(null);
  const debouncedQuery    = useDebounce(query, 300);

  const { data, isFetching } = useQuery({
    queryKey: ["compare-search", debouncedQuery],
    queryFn: () => politiciansService.list({ search: debouncedQuery, limit: 6 }),
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
    const detail = await politiciansService.detail(slug);
    onSelect(detail);
  }

  if (selected) {
    const isMock = !selected.score || selected.score.scoreType === "mock";
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
            <span>{selected.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-semibold text-foreground">{selected.name}</p>
            {!selected.fichaLimpaIneligible && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" aria-label="Ficha limpa" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {selected.party?.acronym ?? "—"} · {OFFICE_LABELS[selected.office] ?? selected.office}
            {selected.state ? ` · ${selected.state}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-lg font-bold tabular-nums ${isMock ? "text-muted-foreground" : "text-foreground"}`}>
            {isMock ? "—" : selected.score!.overall.toFixed(1)}
          </p>
          <p className="text-[10px] text-muted-foreground">/ 10</p>
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
          {data?.data.map((p) => (
            <button
              key={p.id}
              onMouseDown={(e) => { e.preventDefault(); void handleSelect(p.slug); }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary">
                {p.photoUrl ? (
                  <Image src={p.photoUrl} alt={p.name} fill className="object-cover" sizes="32px" />
                ) : (
                  <span>{p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.party?.acronym ?? "—"} · {OFFICE_LABELS[p.office] ?? p.office}
                  {p.state ? ` · ${p.state}` : ""}
                </p>
              </div>
              {p.party && (
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: p.party.colorHex }}
                >
                  {p.party.acronym}
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

// ─── Score bar row ─────────────────────────────────────────────────────────────

function ScoreRow({
  label,
  values,
}: {
  label: string;
  values: Array<{ value: number | null; color: string }>;
}) {
  const maxVal = Math.max(...values.map((v) => v.value ?? 0), 0.001);
  const topVal = Math.max(...values.map((v) => v.value ?? 0));

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
                {value !== null ? value.toFixed(1) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Pillar comparison table ───────────────────────────────────────────────────

function PillarsTable({
  politicians,
  colors,
}: {
  politicians: PoliticianDetail[];
  colors: string[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pilar
            </th>
            {politicians.map((p, i) => (
              <th
                key={p.id}
                className="px-3 py-3 text-center text-xs font-semibold"
                style={{ color: colors[i] }}
              >
                {String.fromCharCode(65 + i)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PILLARS.map((pillar, rowIdx) => {
            const vals = politicians.map((p) =>
              p.score ? getPillarValue(p.score, pillar.key) : null,
            );
            const maxVal = Math.max(...vals.map((v) => v ?? 0), 0.001);
            const topVal = Math.max(...vals.map((v) => v ?? 0));

            return (
              <tr
                key={pillar.key}
                className={`border-b border-border/50 ${rowIdx % 2 === 0 ? "" : "bg-muted/20"}`}
              >
                <td className="px-4 py-3 font-medium text-foreground">{pillar.label}</td>
                {vals.map((val, i) => {
                  const isLeader = val !== null && val > 0 && val === topVal;
                  const pct = ((val ?? 0) / maxVal) * 100;
                  return (
                    <td key={i} className="px-3 py-3">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            isLeader ? "" : "text-muted-foreground"
                          }`}
                          style={isLeader ? { color: colors[i] } : undefined}
                        >
                          {val !== null ? val.toFixed(1) : "—"}
                        </span>
                        <div className="h-1 w-10 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: colors[i] }}
                          />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Comparison panel ─────────────────────────────────────────────────────────

function ComparisonPanel({
  politicians,
  colors,
}: {
  politicians: PoliticianDetail[];
  colors: string[];
}) {
  const [copied, setCopied] = useState(false);

  const winner = politicians.reduce<PoliticianDetail | null>((best, p) => {
    if (!p.score || p.score.scoreType === "mock") return best;
    if (!best?.score || best.score.scoreType === "mock") return p;
    return p.score.overall > best.score.overall ? p : best;
  }, null);

  const gridClass =
    politicians.length === 2
      ? "grid-cols-2"
      : politicians.length === 3
        ? "grid-cols-3"
        : "grid-cols-2 sm:grid-cols-4";

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const names = politicians.map((p) => p.name).join(", ");
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

  const pillarValues = (pillarKey: string) =>
    politicians.map((p, i) => ({
      value: p.score ? getPillarValue(p.score, pillarKey) : null,
      color: colors[i] ?? SLOT_COLORS[i] ?? SLOT_COLORS[0],
    }));

  const thematicValues = (key: keyof PoliticianScore) =>
    politicians.map((p, i) => ({
      value: getScoreValue(p.score, key),
      color: colors[i] ?? SLOT_COLORS[i] ?? SLOT_COLORS[0],
    }));

  return (
    <div className="mt-8 space-y-6">
      {/* Header cards */}
      <div className={`grid gap-3 ${gridClass}`}>
        {politicians.map((p, i) => {
          const isMock = !p.score || p.score.scoreType === "mock";
          return (
            <div
              key={p.id}
              className="relative rounded-xl border-2 bg-background p-4 text-center"
              style={{ borderColor: `${colors[i]}44` }}
            >
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
                {p.photoUrl ? (
                  <Image src={p.photoUrl} alt={p.name} fill className="object-cover" sizes="56px" />
                ) : (
                  <span>{p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                )}
              </div>

              <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {p.party?.acronym ?? "—"} · {OFFICE_LABELS[p.office] ?? p.office}
              </p>

              {!p.fichaLimpaIneligible && (
                <div className="mt-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-success" />
                  <span className="text-[10px] text-success">Ficha limpa</span>
                </div>
              )}

              <div className="mt-2 flex items-center justify-center gap-1">
                <span
                  className={`text-xl font-bold tabular-nums ${isMock ? "text-muted-foreground" : ""}`}
                  style={!isMock && p === winner ? { color: colors[i] } : undefined}
                >
                  {isMock ? "—" : p.score!.overall.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>

              {!isMock && p === winner && (
                <span
                  className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                  style={{ backgroundColor: colors[i] }}
                >
                  Maior score
                </span>
              )}
              {isMock && (
                <span className="mt-1.5 inline-block text-[10px] text-muted-foreground">
                  Dados em coleta
                </span>
              )}

              <div className="mt-3 flex flex-col items-center gap-2">
                <FollowButton
                  candidateId={p.id}
                  variant="full"
                  className="w-full justify-center text-xs h-8 px-3"
                />
                <Link
                  href={`/perfil/${p.slug}`}
                  className="flex items-center justify-center gap-1 text-xs hover:underline"
                  style={{ color: colors[i] }}
                >
                  Ver perfil
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pillars table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">5 Pilares</h3>
        <PillarsTable politicians={politicians} colors={colors} />
      </div>

      {/* Score bars by section */}
      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        {politicians.length > 2 && (
          <div className="mb-5 flex flex-wrap gap-3">
            {politicians.map((p, i) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: colors[i] }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-xs text-muted-foreground">{p.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Dimensões temáticas</h3>
          {SCORE_MAIN_KEYS.map((key) => (
            <ScoreRow
              key={key}
              label={SCORE_LABELS_FULL[key]}
              values={thematicValues(key as keyof PoliticianScore)}
            />
          ))}
          <h3 className="mt-6 border-t border-border pt-5 text-sm font-semibold text-foreground">
            Dimensões estendidas
          </h3>
          {SCORE_EXTENDED_KEYS.map((key) => (
            <ScoreRow
              key={key}
              label={SCORE_LABELS_FULL[key]}
              values={thematicValues(key as keyof PoliticianScore)}
            />
          ))}
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
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

// ─── Main component ───────────────────────────────────────────────────────────

export function PoliticianComparisonClient() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [slots,        setSlots]        = useState<Slots>([...EMPTY_SLOTS]);
  const [visibleCount, setVisibleCount] = useState(MIN_SLOTS);

  useEffect(() => {
    async function loadFromParams() {
      const fetches = SLOT_PARAMS.map((p) => {
        const slug = searchParams.get(p);
        return slug ? politiciansService.detail(slug).catch(() => null) : Promise.resolve(null);
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

  useEffect(() => {
    const params = new URLSearchParams();
    slots.slice(0, visibleCount).forEach((p, i) => {
      const param = SLOT_PARAMS[i];
      if (p && param) params.set(param, p.slug);
    });
    const qs = params.toString();
    router.replace(qs ? `/comparar?${qs}` : "/comparar", { scroll: false });
  }, [slots, visibleCount, router]);

  function setSlot(index: number, politician: PoliticianDetail | null) {
    setSlots((prev) => {
      const next = [...prev] as Slots;
      next[index] = politician;
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

  const activePoliticians = slots.slice(0, visibleCount).filter(Boolean) as PoliticianDetail[];
  const canCompare        = activePoliticians.length >= MIN_SLOTS;
  const slotColors        = Array.from({ length: visibleCount }, (_, i) => SLOT_COLORS[i] ?? SLOT_COLORS[0]);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Comparar Políticos
          </h1>
          <p className="mt-3 text-muted-foreground">
            Selecione de 2 a 4 políticos para ver uma comparação detalhada de scores por dimensão.
          </p>
        </div>

        <div
          className={`grid gap-4 ${
            visibleCount === 1 ? "grid-cols-1" :
            visibleCount === 2 ? "grid-cols-1 sm:grid-cols-2" :
            visibleCount === 3 ? "grid-cols-1 sm:grid-cols-3" :
            "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {Array.from({ length: visibleCount }, (_, i) => (
            <PoliticianSearchBox
              key={i}
              label={SLOT_LABELS[i] ?? `Perfil ${String.fromCharCode(65 + i)}`}
              color={slotColors[i] ?? SLOT_COLORS[0]}
              selected={slots[i] ?? null}
              onSelect={(p) => setSlot(i, p)}
              onRemoveSlot={i >= MIN_SLOTS ? () => removeSlot(i) : undefined}
            />
          ))}
        </div>

        {visibleCount < MAX_SLOTS && (
          <button
            onClick={addSlot}
            className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Adicionar político para comparação
          </button>
        )}

        {!canCompare && (
          <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {activePoliticians.length === 0
                ? "Selecione ao menos dois políticos para iniciar a comparação."
                : "Selecione mais um político para comparar."}
            </p>
          </div>
        )}

        {canCompare && (
          <ComparisonPanel
            politicians={activePoliticians}
            colors={slotColors.slice(0, activePoliticians.length)}
          />
        )}
      </div>
    </div>
  );
}
