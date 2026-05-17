"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Copy, Share2, X, ClipboardList, Check,
  Search, Printer, Heart, Plus, Minus,
} from "lucide-react";
import { candidatesService } from "@/lib/api/services";
import { useDebounce } from "@/hooks/use-debounce";
import { useFollows } from "@/hooks/use-follows";
import { useIsAuthenticated } from "@/hooks/use-session";

// ─── Types ───────────────────────────────────────────────────────────────────

type ElectionType = "gerais" | "municipais";

type GeneralKey =
  | "deputado_federal" | "deputado_estadual"
  | "senador_1" | "senador_2"
  | "governador" | "presidente";

type MunicipalKey = "vereador" | "prefeito";

type GeneralMap   = Record<GeneralKey, string>;
type MunicipalMap = Record<MunicipalKey, string>;

type GeneralOffice  = { key: GeneralKey;  label: string; office: string; optional?: true };
type MunicipalOffice = { key: MunicipalKey; label: string; office: string };

// Ordem da urna: eleições gerais
const GENERAL_OFFICES: readonly GeneralOffice[] = [
  { key: "deputado_federal",  label: "Deputado(a) Federal",  office: "federal_deputy" },
  { key: "deputado_estadual", label: "Deputado(a) Estadual", office: "state_deputy" },
  { key: "senador_1",         label: "Senador(a)",           office: "senator" },
  { key: "senador_2",         label: "Senador(a) (2°)",      office: "senator", optional: true },
  { key: "governador",        label: "Governador(a)",        office: "governor" },
  { key: "presidente",        label: "Presidente",           office: "president" },
];

// Ordem da urna: eleições municipais
const MUNICIPAL_OFFICES: readonly MunicipalOffice[] = [
  { key: "vereador", label: "Vereador(a)", office: "city_councilor" },
  { key: "prefeito", label: "Prefeito(a)", office: "mayor" },
];

const EMPTY_GENERAL: GeneralMap = {
  deputado_federal: "", deputado_estadual: "",
  senador_1: "", senador_2: "", governador: "", presidente: "",
};

const EMPTY_MUNICIPAL: MunicipalMap = { vereador: "", prefeito: "" };

const OFFICE_TO_GENERAL_KEY: Partial<Record<string, GeneralKey>> = {
  federal_deputy: "deputado_federal",
  state_deputy:   "deputado_estadual",
  senator:        "senador_1",
  governor:       "governador",
  president:      "presidente",
};

// ─── Encoding / Decoding ──────────────────────────────────────────────────────

function encodeCola(
  type: ElectionType,
  general: GeneralMap,
  municipal: MunicipalMap,
): string {
  if (type === "gerais") {
    const parts = GENERAL_OFFICES.map(({ key }) => general[key]).join("|");
    return btoa(encodeURIComponent(`G:${parts}`));
  }
  const parts = MUNICIPAL_OFFICES.map(({ key }) => municipal[key]).join("|");
  return btoa(encodeURIComponent(`M:${parts}`));
}

function decodeCola(encoded: string): {
  type: ElectionType;
  general: GeneralMap;
  municipal: MunicipalMap;
} | null {
  try {
    const raw = decodeURIComponent(atob(encoded));

    if (raw.startsWith("G:")) {
      const parts = raw.slice(2).split("|");
      if (parts.length !== GENERAL_OFFICES.length) return null;
      const general = { ...EMPTY_GENERAL };
      GENERAL_OFFICES.forEach(({ key }, i) => { general[key] = parts[i] ?? ""; });
      return { type: "gerais", general, municipal: { ...EMPTY_MUNICIPAL } };
    }

    if (raw.startsWith("M:")) {
      const parts = raw.slice(2).split("|");
      if (parts.length !== MUNICIPAL_OFFICES.length) return null;
      const municipal = { ...EMPTY_MUNICIPAL };
      MUNICIPAL_OFFICES.forEach(({ key }, i) => { municipal[key] = parts[i] ?? ""; });
      return { type: "municipais", general: { ...EMPTY_GENERAL }, municipal };
    }

    // Legacy format (5 parts, no prefix) — silently drop
    return null;
  } catch {
    return null;
  }
}

// ─── Search Dropdown ──────────────────────────────────────────────────────────

interface SearchDropdownProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  officeFilter: string;
  placeholder: string;
}

function ProfileSearchDropdown({
  id, value, onChange, officeFilter, placeholder,
}: SearchDropdownProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen]   = useState(false);
  const containerRef      = useRef<HTMLDivElement>(null);
  const debouncedQuery    = useDebounce(query, 300);

  const { data, isFetching } = useQuery({
    queryKey: ["cola-search", debouncedQuery, officeFilter],
    queryFn: () =>
      candidatesService.list({ search: debouncedQuery, office: officeFilter, limit: 6 }),
    enabled:   debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
  });

  const suggestions = data?.data ?? [];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleInputChange(v: string) {
    setQuery(v);
    onChange(v);
    setOpen(true);
  }

  function handleSelect(name: string, acronym: string | undefined) {
    const label = acronym ? `${name} (${acronym})` : name;
    setQuery(label);
    onChange(label);
    setOpen(false);
  }

  function handleClear() {
    setQuery("");
    onChange("");
    setOpen(false);
  }

  const showDropdown = open && debouncedQuery.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <Search className="pointer-events-none absolute left-0 h-4 w-4 shrink-0 text-muted-foreground/60" />
      <input
        id={id}
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => debouncedQuery.trim().length >= 2 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="flex-1 bg-transparent pl-6 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
      {isFetching && (
        <div className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      )}
      {query && !isFetching && (
        <button
          onClick={handleClear}
          aria-label="Limpar campo"
          className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-background shadow-md">
          {suggestions.map((c) => (
            <button
              key={c.id}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(c.name, c.party?.acronym);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.party?.acronym ?? "—"}
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
        </div>
      )}

      {showDropdown && suggestions.length === 0 && !isFetching && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-background px-4 py-3 text-xs text-muted-foreground shadow-md">
          Nenhum perfil encontrado. Você pode digitar manualmente.
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ColaEleitoralPage() {
  const searchParams   = useSearchParams();
  const previewRef     = useRef<HTMLDivElement>(null);
  const isAuthenticated = useIsAuthenticated();

  const [electionType, setElectionType] = useState<ElectionType>("gerais");
  const [showSenador2, setShowSenador2] = useState(false);
  const [general,  setGeneral]  = useState<GeneralMap>({ ...EMPTY_GENERAL });
  const [municipal, setMunicipal] = useState<MunicipalMap>({ ...EMPTY_MUNICIPAL });
  const [copied,  setCopied]  = useState(false);
  const [filledFromFavorites, setFilledFromFavorites] = useState(false);

  const { data: follows = [] } = useFollows();

  // Load from URL on mount
  useEffect(() => {
    const encoded = searchParams.get("lista");
    if (!encoded) return;
    const decoded = decodeCola(encoded);
    if (!decoded) return;
    setElectionType(decoded.type);
    setGeneral(decoded.general);
    setMunicipal(decoded.municipal);
    if (decoded.general.senador_2) setShowSenador2(true);
  }, [searchParams]);

  // Active offices for current tab (excluding optional senador_2 when hidden)
  const activeGeneralOffices = GENERAL_OFFICES.filter(
    (o) => !o.optional || (o.key === "senador_2" && showSenador2),
  );
  const activeOffices = electionType === "gerais" ? activeGeneralOffices : MUNICIPAL_OFFICES;
  const activeMap: Record<string, string> = electionType === "gerais" ? general : municipal;

  function handleChange(key: string, value: string) {
    if (electionType === "gerais") {
      setGeneral((prev) => ({ ...prev, [key]: value }));
    } else {
      setMunicipal((prev) => ({ ...prev, [key]: value }));
    }
  }

  function fillFromFavorites() {
    if (follows.length === 0) return;
    const update: Partial<GeneralMap> = {};
    for (const f of follows) {
      const key = OFFICE_TO_GENERAL_KEY[f.candidate.office];
      if (key && !update[key]) {
        const acronym = f.candidate.party?.acronym;
        update[key] = acronym ? `${f.candidate.name} (${acronym})` : f.candidate.name;
      }
    }
    setGeneral((prev) => ({ ...prev, ...update }));
    setFilledFromFavorites(true);
    setTimeout(() => setFilledFromFavorites(false), 2500);
  }

  function buildShareUrl(): string {
    const encoded = encodeCola(electionType, general, municipal);
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/cola-eleitoral?lista=${encoded}`;
  }

  async function handleShare() {
    const url = buildShareUrl();
    if (navigator.share) {
      await navigator.share({ title: "Minha Cola Eleitoral — Smart Politics", url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleCopyLink() {
    void navigator.clipboard.writeText(buildShareUrl()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const filledCount = activeOffices.filter(({ key }) => activeMap[key]).length;
  const totalSlots  = activeOffices.length;
  const isEmpty     = filledCount === 0;

  const previewOffices = electionType === "gerais"
    ? activeGeneralOffices.filter(({ key }) => general[key])
    : MUNICIPAL_OFFICES.filter(({ key }) => municipal[key]);

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #cola-print-root { display: block !important; position: fixed; inset: 0; padding: 24px; }
        }
      `}</style>

      <div id="cola-print-root" className="hidden">
        <PrintCard
          electionType={electionType}
          general={general}
          municipal={municipal}
          activeGeneralOffices={activeGeneralOffices}
        />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <ClipboardList className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cola Eleitoral
          </h1>
          <p className="mt-3 text-muted-foreground">
            Busque políticos por nome ou partido e monte sua lista para não esquecer na hora de votar.
          </p>
        </div>

        {/* Election type tabs */}
        <div className="mb-6 flex items-center rounded-xl border border-border bg-muted/40 p-1">
          {(["gerais", "municipais"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setElectionType(type)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                electionType === type
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "gerais" ? "Eleições Gerais" : "Eleições Municipais"}
            </button>
          ))}
        </div>

        {/* Fill from favorites (gerais only, since no municipal politicians in DB) */}
        {electionType === "gerais" && isAuthenticated === true && follows.length > 0 && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={fillFromFavorites}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Heart className="h-4 w-4 fill-current text-destructive" />
              {filledFromFavorites ? "Preenchido!" : `Preencher com favoritos (${follows.length})`}
            </button>
          </div>
        )}

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {activeOffices.map(({ key, label, office }) => (
            <div
              key={key}
              className="rounded-xl border border-border bg-background p-4 transition-colors focus-within:border-border-strong"
            >
              <label
                htmlFor={key}
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {label}
              </label>
              <ProfileSearchDropdown
                id={key}
                value={activeMap[key] ?? ""}
                onChange={(v) => handleChange(key, v)}
                officeFilter={office}
                placeholder="Busque por nome ou partido..."
              />
            </div>
          ))}

          {/* Senador 2 toggle (only in gerais) */}
          {electionType === "gerais" && (
            <button
              onClick={() => {
                if (showSenador2) {
                  setGeneral((prev) => ({ ...prev, senador_2: "" }));
                }
                setShowSenador2((v) => !v);
              }}
              className="flex items-center gap-2 self-start rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              {showSenador2 ? (
                <><Minus className="h-3.5 w-3.5" />Remover 2° Senador(a)</>
              ) : (
                <><Plus className="h-3.5 w-3.5" />Adicionar 2° Senador(a)</>
              )}
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: totalSlots > 0 ? `${(filledCount / totalSlots) * 100}%` : "0%" }}
            />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {filledCount}/{totalSlots} preenchidos
          </span>
        </div>

        {/* Preview card */}
        {!isEmpty && (
          <div
            ref={previewRef}
            id="cola-preview"
            className="mt-8 overflow-hidden rounded-xl border-2 border-primary/30 bg-background"
          >
            <div className="bg-primary px-6 py-4 text-center">
              <p className="text-lg font-bold text-primary-foreground">Minha Cola Eleitoral</p>
              <p className="text-sm text-primary-foreground/80">
                {electionType === "gerais" ? "Eleições Gerais" : "Eleições Municipais"} · Smart Politics
              </p>
            </div>
            <div className="divide-y divide-border p-2">
              {previewOffices.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </span>
                  <span className="max-w-[60%] truncate text-right text-sm font-semibold text-foreground">
                    {activeMap[key]}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">smartpolitics.com.br</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            disabled={isEmpty}
            onClick={handleCopyLink}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? (
              <><Check className="h-4 w-4 text-success" />Link copiado!</>
            ) : (
              <><Copy className="h-4 w-4" />Copiar link</>
            )}
          </button>

          <button
            disabled={isEmpty}
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Printer className="h-4 w-4" />
            Imprimir / Salvar
          </button>

          <button
            disabled={isEmpty}
            onClick={() => void handleShare()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Crie uma conta para salvar sua cola permanentemente.{" "}
          <a href="/cadastro" className="font-medium text-primary hover:text-primary/80">
            Criar conta grátis
          </a>
        </p>
      </div>
    </>
  );
}

// ─── Print Card ───────────────────────────────────────────────────────────────

function PrintCard({
  electionType,
  general,
  municipal,
  activeGeneralOffices,
}: {
  electionType: ElectionType;
  general: GeneralMap;
  municipal: MunicipalMap;
  activeGeneralOffices: readonly { key: string; label: string }[];
}) {
  const rows =
    electionType === "gerais"
      ? activeGeneralOffices.filter(({ key }) => general[key as GeneralKey])
      : MUNICIPAL_OFFICES.filter(({ key }) => municipal[key]);

  const activeMap: Record<string, string> = electionType === "gerais" ? general : municipal;
  const subtitle = electionType === "gerais" ? "Eleições Gerais" : "Eleições Municipais";

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", fontFamily: "sans-serif" }}>
      <div
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: "16px 24px",
          textAlign: "center",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <p style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>Minha Cola Eleitoral</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>
          {subtitle} · Smart Politics
        </p>
      </div>
      <div
        style={{
          border: "2px solid #2563eb",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          overflow: "hidden",
        }}
      >
        {rows.map(({ key, label }) => (
          <div
            key={key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 20px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#6b7280",
              }}
            >
              {label}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {activeMap[key]}
            </span>
          </div>
        ))}
        <div style={{ padding: "12px 20px", textAlign: "center" }}>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>smartpolitics.com.br</span>
        </div>
      </div>
    </div>
  );
}
