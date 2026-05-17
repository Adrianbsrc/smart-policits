"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useRanking } from "@/hooks/use-ranking";
import { useDebounce } from "@/hooks/use-debounce";
import { CandidateCard, CandidateCardSkeleton } from "@/components/candidates/candidate-card";
import { OFFICE_OPTIONS, STATE_OPTIONS } from "@/lib/content/labels";

const PARTY_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "PT", label: "PT" },
  { value: "PL", label: "PL" },
  { value: "UNIÃO", label: "UNIÃO" },
  { value: "MDB", label: "MDB" },
  { value: "PP", label: "PP" },
  { value: "PSD", label: "PSD" },
  { value: "PSDB", label: "PSDB" },
  { value: "PSB", label: "PSB" },
  { value: "PDT", label: "PDT" },
  { value: "REPUBLICANOS", label: "REPUBLICANOS" },
  { value: "NOVO", label: "NOVO" },
  { value: "PSOL", label: "PSOL" },
  { value: "AVANTE", label: "AVANTE" },
  { value: "REDE", label: "REDE" },
  { value: "PODE", label: "PODE" },
] as const;

const PAGE_SIZE = 15;

function getPaginationRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const delta = 2;
  const pages: (number | "...")[] = [1];

  const rangeStart = Math.max(2, current - delta);
  const rangeEnd = Math.min(total - 1, current + delta);

  if (rangeStart > 2) pages.push("...");
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < total - 1) pages.push("...");

  pages.push(total);
  return pages;
}

export function RankingClient() {
  const [search, setSearch] = useState("");
  const [office, setOffice] = useState("");
  const [state, setState] = useState("");
  const [party, setParty] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError, isFetching } = useRanking({
    ...(office && { office }),
    ...(state && { state }),
    ...(party && { party }),
    ...(debouncedSearch && { search: debouncedSearch }),
    page,
    limit: PAGE_SIZE,
  });

  // Reset page when filters change
  const handleOffice = (v: string) => { setOffice(v); setPage(1); };
  const handleState = (v: string) => { setState(v); setPage(1); };
  const handleParty = (v: string) => { setParty(v); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const candidates = data?.data ?? [];
  const meta = data?.meta;
  const filtered = candidates;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Filters sidebar */}
      <aside className="shrink-0 lg:w-52">
        <div className="sticky top-20 rounded-xl border border-border bg-background p-4">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Filtros</span>
          </div>
          <div className="flex flex-col gap-4">
            <FilterSelect label="Cargo" options={OFFICE_OPTIONS} value={office} onChange={handleOffice} />
            <FilterSelect label="Estado" options={STATE_OPTIONS} value={state} onChange={handleState} />
            <FilterSelect label="Partido" options={PARTY_OPTIONS} value={party} onChange={handleParty} />
          </div>
          {(office || state || party) && (
            <button
              onClick={() => { setOffice(""); setState(""); setParty(""); setPage(1); }}
              className="mt-4 w-full rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nome ou partido..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Buscar candidatos"
          />
        </div>

        {/* Count */}
        <p className="mb-4 text-sm text-muted-foreground">
          {isLoading ? "Carregando..." : (
            <>
              {meta?.total ?? filtered.length}{" "}
              {(meta?.total ?? filtered.length) === 1 ? "candidato encontrado" : "candidatos encontrados"}
              {isFetching && !isLoading && <span className="ml-2 text-xs opacity-60">atualizando...</span>}
            </>
          )}
        </p>

        {/* Error state */}
        {isError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">Erro ao carregar candidatos.</p>
            <p className="mt-1 text-xs text-muted-foreground">Verifique sua conexão e tente novamente.</p>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => <CandidateCardSkeleton key={i} />)}
          </div>
        )}

        {/* Candidate list */}
        {!isLoading && !isError && (
          <>
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-border bg-background p-12 text-center">
                <p className="text-base font-medium text-foreground">Nenhum candidato encontrado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tente ajustar os filtros ou buscar por outro nome.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((c) => <CandidateCard key={c.id} candidate={c} />)}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && !debouncedSearch && (
              <div className="mt-6 flex items-center justify-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrev}
                  aria-label="Página anterior"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPaginationRange(meta.page, meta.totalPages).map((item, i) =>
                  item === "..." ? (
                    <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      aria-current={meta.page === item ? "page" : undefined}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition-colors ${
                        meta.page === item
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}

                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={!meta.hasNext}
                  aria-label="Próxima página"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

function FilterSelect({ label, options, value, onChange }: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
