"use client";

import { useCallback, useState } from "react";
import { Search, X, RotateCcw, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRanking } from "@/hooks/use-ranking";
import { useDebounce } from "@/hooks/use-debounce";
import { PoliticianCard, PoliticianCardSkeleton } from "@/components/politicians/politician-card";
import { GlassCard } from "@/components/ui/glass-card";
import { LiqPill } from "@/components/ui/liq-pill";
import { AdSlot } from "@/components/ui/ad-slot";
import { STATE_OPTIONS } from "@/lib/content/labels";
import type { RankingFilters } from "@/lib/api/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const OFFICE_TABS = [
  { label: "Presidentes",  value: "president"      },
  { label: "Governadores", value: "governor"       },
  { label: "Senado",       value: "senator"        },
  { label: "Câmara",       value: "federal_deputy" },
  { label: "Estaduais",    value: "state_deputy"   },
] as const;

const PARTY_OPTIONS = [
  "PT","PL","UNIÃO","MDB","PP","PSD","PSDB","PSB","PDT",
  "REPUBLICANOS","NOVO","PSOL","AVANTE","REDE","PODE","PV",
  "SOLIDARIEDADE","PATRIOTA","DC","PCdoB","PCB","PCO",
] as const;

const SORT_OPTIONS = [
  { value: "overall",             label: "Score Geral"      },
  { value: "transparency",        label: "Transparência"    },
  { value: "activity",            label: "Presença"         },
  { value: "constitutional",      label: "Coerência"        },
  { value: "integrityMultiplier", label: "Integridade"      },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const ATTRIBUTE_OPTIONS = [
  { value: "fichaLimpa",   label: "Ficha Limpa"              },
  { value: "estreante",    label: "Estreante (1º mandato)"   },
  { value: "reeleito",     label: "Reeleito (2+ mandatos)"   },
  { value: "veterano",     label: "Veterano (3+ mandatos)"   },
  { value: "preCandidate", label: "Pré-candidato 2026"       },
] as const;

type AttributeKey = (typeof ATTRIBUTE_OPTIONS)[number]["value"];

const PAGE_SIZE = 15;

// ─── Pagination range ────────────────────────────────────────────────────────

function getPaginationRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const delta = 2;
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - delta);
  const end   = Math.min(total - 1, current + delta);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

// ─── RankingClient ───────────────────────────────────────────────────────────

export function RankingClient() {
  const [office,       setOffice]       = useState<string>("federal_deputy");
  const [search,       setSearch]       = useState("");
  const debouncedSearch                 = useDebounce(search, 400);
  const [states,       setStates]       = useState<string[]>([]);
  const [parties,      setParties]      = useState<string[]>([]);
  const [attributes,   setAttributes]   = useState<Set<AttributeKey>>(new Set());
  const [sortBy,       setSortBy]       = useState<SortValue>("overall");
  const [page,         setPage]         = useState(1);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  const attrEnabled = (key: AttributeKey) => attributes.has(key);

  const toggleAttribute = (key: AttributeKey) => {
    setAttributes((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setPage(1);
  };

  const toggleState = (s: string) => {
    setStates((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
    setPage(1);
  };

  const toggleParty = (p: string) => {
    setParties((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
    setPage(1);
  };

  const resetFilters = useCallback(() => {
    setStates([]);
    setParties([]);
    setAttributes(new Set());
    setSortBy("overall");
    setPage(1);
    setSearch("");
  }, []);

  const filters: RankingFilters = {
    ...(office                        && { office }),
    ...(states.length                 && { state: states }),
    ...(parties.length                && { party: parties }),
    ...(debouncedSearch               && { search: debouncedSearch }),
    ...(attrEnabled("fichaLimpa")     && { fichaLimpa:   true }),
    ...(attrEnabled("estreante")      && { estreante:    true }),
    ...(attrEnabled("reeleito")       && { reeleito:     true }),
    ...(attrEnabled("veterano")       && { veterano:     true }),
    ...(attrEnabled("preCandidate")   && { preCandidate: true }),
    ...(sortBy !== "overall"          && { sortBy }),
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, isFetching } = useRanking(filters);

  const hasActiveFilters = Boolean(
    states.length || parties.length || attributes.size ||
    debouncedSearch || sortBy !== "overall",
  );

  const politicians    = data?.data ?? [];
  const meta           = data?.meta;
  const activeSortLabel = sortBy !== "overall"
    ? SORT_OPTIONS.find((o) => o.value === sortBy)?.label
    : null;
  const activeAttrLabels = ATTRIBUTE_OPTIONS
    .filter(({ value }) => attrEnabled(value))
    .map(({ value, label }) => ({ key: value, label }));

  return (
    <div className="relative min-h-screen">
      {/* Fundo Liquid */}
      <div className="page-gradient pointer-events-none absolute inset-0" aria-hidden />
      <div className="dot-pattern pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      <div className="relative mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <LiqPill tone="accent" className="mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Atualizado em tempo real
            </LiqPill>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
              Ranking geral
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLoading
                ? "Carregando…"
                : `${(meta?.total ?? 0).toLocaleString("pt-BR")} parlamentares · ordenado por ${
                    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "score geral"
                  }`}
              {isFetching && !isLoading && (
                <span className="ml-2 text-xs opacity-60">atualizando…</span>
              )}
            </p>
          </div>

          {/* Office tabs */}
          <div className="flex shrink-0 flex-wrap gap-1.5">
            {OFFICE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setOffice(tab.value);
                  setPage(1);
                  if (tab.value === "president") setStates([]);
                }}
                className={cn(
                  "rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition-all duration-150",
                  "backdrop-blur-md",
                  office === tab.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="flex gap-6">

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
          )}

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300",
              "lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:translate-x-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            )}
            aria-label="Filtros"
          >
            {/* Sticky wrapper com scroll interno */}
            <div className="sticky top-20 flex max-h-[calc(100vh-5rem)] flex-col gap-4 overflow-y-auto pb-4">
              <GlassCard className="flex flex-col gap-4 p-5">

                {/* Header da sidebar */}
                <div className="flex items-center justify-between">
                  <span className="font-display text-[15px] font-bold text-foreground">Filtros</span>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                      >
                        Limpar tudo
                      </button>
                    )}
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="rounded p-1 text-muted-foreground hover:text-foreground lg:hidden"
                      aria-label="Fechar filtros"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Busca */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Buscar nome…"
                    className="h-9 w-full rounded-lg border border-border bg-background/60 pl-9 pr-3 text-[12.5px] text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {/* Ordenar por */}
                <SidebarSection label="Ordenar por" icon={<ArrowUpDown className="h-3 w-3" />}>
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <SidebarRadio
                      key={value}
                      label={label}
                      checked={sortBy === value}
                      onChange={() => { setSortBy(value); setPage(1); }}
                    />
                  ))}
                </SidebarSection>

                {/* Atributos */}
                <SidebarSection label="Atributos">
                  {ATTRIBUTE_OPTIONS.map(({ value, label }) => (
                    <SidebarCheckbox
                      key={value}
                      label={label}
                      checked={attrEnabled(value)}
                      onChange={() => toggleAttribute(value)}
                    />
                  ))}
                </SidebarSection>

                {/* Partido — com scroll próprio */}
                <SidebarSection label="Partido">
                  <div className="max-h-48 overflow-y-auto rounded-lg">
                    <SidebarCheckbox
                      label="Todos"
                      checked={parties.length === 0}
                      onChange={() => { setParties([]); setPage(1); }}
                    />
                    {PARTY_OPTIONS.map((p) => (
                      <SidebarCheckbox
                        key={p}
                        label={p}
                        checked={parties.includes(p)}
                        onChange={() => toggleParty(p)}
                      />
                    ))}
                  </div>
                </SidebarSection>

                {/* Estado — oculto para presidente */}
                {office !== "president" && (
                  <SidebarSection label="Estado">
                    <div className="max-h-48 overflow-y-auto rounded-lg">
                      <div className="grid grid-cols-2 gap-x-1">
                        <SidebarCheckbox
                          label="Todos"
                          checked={states.length === 0}
                          onChange={() => { setStates([]); setPage(1); }}
                        />
                        {STATE_OPTIONS.filter((s) => s.value).map((s) => (
                          <SidebarCheckbox
                            key={s.value}
                            label={s.label}
                            checked={states.includes(s.value)}
                            onChange={() => toggleState(s.value)}
                          />
                        ))}
                      </div>
                    </div>
                  </SidebarSection>
                )}
              </GlassCard>

              {/* Ad slot lateral */}
              <AdSlot
                slot="ranking-sidebar"
                format="rectangle"
                note="300 × 250 · abaixo dos filtros · acompanha a rolagem"
              />
            </div>
          </aside>

          {/* ── Lista principal ─────────────────────────────────────── */}
          <div className="min-w-0 flex-1">

            {/* Mobile: botão filtros */}
            <div className="mb-4 flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-border glass px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {states.length + parties.length + attributes.size + (sortBy !== "overall" ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Chips de filtros ativos */}
            {hasActiveFilters && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {states.map((s) => (
                  <FilterChip key={s} label={s} onRemove={() => toggleState(s)} />
                ))}
                {parties.map((p) => (
                  <FilterChip key={p} label={p} onRemove={() => toggleParty(p)} />
                ))}
                {activeAttrLabels.map(({ key, label }) => (
                  <FilterChip key={key} label={label} onRemove={() => toggleAttribute(key as AttributeKey)} />
                ))}
                {activeSortLabel && (
                  <FilterChip
                    label={`Ordenado: ${activeSortLabel}`}
                    onRemove={() => setSortBy("overall")}
                  />
                )}
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 rounded-full border border-border bg-card/80 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                >
                  <RotateCcw className="h-3 w-3" />
                  Limpar tudo
                </button>
              </div>
            )}

            {/* Error */}
            {isError && (
              <GlassCard className="p-8 text-center">
                <p className="text-sm text-destructive">Erro ao carregar parlamentares.</p>
                <p className="mt-1 text-xs text-muted-foreground">Verifique sua conexão e tente novamente.</p>
              </GlassCard>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 8 }).map((_, i) => <PoliticianCardSkeleton key={i} />)}
              </div>
            )}

            {/* Lista */}
            {!isLoading && !isError && (
              <>
                {politicians.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <p className="text-base font-semibold text-foreground">
                      Nenhum parlamentar encontrado
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tente ajustar os filtros ou buscar por outro nome.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Limpar filtros
                      </button>
                    )}
                  </GlassCard>
                ) : (
                  <div className="flex flex-col gap-2">
                    {politicians.map((p, idx) => (
                      <div key={p.id}>
                        <PoliticianCard candidate={p} />
                        {/* Ad in-feed a cada 8 itens */}
                        {(idx + 1) % 8 === 0 && idx < politicians.length - 1 && (
                          <AdSlot
                            slot="ranking-inline"
                            format="native-row"
                            note="In-feed · mesma largura dos cards · marcado como Publicidade"
                            className="my-2"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Paginação */}
                {meta && meta.totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!meta.hasPrev}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border glass text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                      aria-label="Página anterior"
                    >
                      ‹
                    </button>
                    {getPaginationRange(meta.page, meta.totalPages).map((item, i) =>
                      item === "..." ? (
                        <span key={`e-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          aria-current={meta.page === item ? "page" : undefined}
                          className={cn(
                            "flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-sm transition-all",
                            meta.page === item
                              ? "border-primary bg-primary font-bold text-primary-foreground"
                              : "border-border glass text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {item}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                      disabled={!meta.hasNext}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border glass text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                      aria-label="Próxima página"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar sub-components ───────────────────────────────────────────────────

function SidebarSection({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4">
      <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[1.2px] text-muted-foreground">
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

function SidebarCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1.5 text-[12.5px] transition-colors hover:bg-muted/60">
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "relative flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-sm border transition-colors",
            checked ? "border-primary bg-primary" : "border-muted-foreground/40 bg-transparent",
          )}
        >
          {checked && (
            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 5l2.5 2.5 4.5-5" />
            </svg>
          )}
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
          />
        </span>
        <span className={cn(checked ? "font-semibold text-foreground" : "text-muted-foreground")}>
          {label}
        </span>
      </span>
    </label>
  );
}

function SidebarRadio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-[12.5px] transition-colors hover:bg-muted/60">
      <span
        className={cn(
          "relative flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-full border transition-colors",
          checked ? "border-primary bg-primary" : "border-muted-foreground/40",
        )}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
        <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
      </span>
      <span className={cn(checked ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </label>
  );
}

function FilterChip({ label, onRemove }: { label?: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1 rounded-full border border-border glass px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
    >
      {label}
      <X className="h-3 w-3 text-muted-foreground" />
    </button>
  );
}
