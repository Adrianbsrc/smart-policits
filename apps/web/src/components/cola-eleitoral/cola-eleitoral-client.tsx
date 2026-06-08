"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Share2, X, ClipboardList, Check, Printer, Heart, Plus, Minus } from "lucide-react";

import { ProfileSearchDropdown } from "@/components/cola-eleitoral/profile-search-dropdown";
import { PrintCard } from "@/components/cola-eleitoral/print-card";
import { useFollows } from "@/hooks/use-follows";
import { useIsAuthenticated } from "@/hooks/use-session";

// ─── Types ────────────────────────────────────────────────────────────────────

type ElectionType = "gerais" | "municipais";

type GeneralKey =
  | "deputado_federal" | "deputado_estadual"
  | "senador_1" | "senador_2"
  | "governador" | "presidente";

type MunicipalKey = "vereador" | "prefeito";

type GeneralMap   = Record<GeneralKey, string>;
type MunicipalMap = Record<MunicipalKey, string>;

type GeneralOffice   = { key: GeneralKey;  label: string; office: string; optional?: true };
type MunicipalOffice = { key: MunicipalKey; label: string; office: string };

const GENERAL_OFFICES: readonly GeneralOffice[] = [
  { key: "deputado_federal",  label: "Deputado(a) Federal",  office: "federal_deputy" },
  { key: "deputado_estadual", label: "Deputado(a) Estadual", office: "state_deputy" },
  { key: "senador_1",         label: "Senador(a)",           office: "senator" },
  { key: "senador_2",         label: "Senador(a) (2°)",      office: "senator", optional: true },
  { key: "governador",        label: "Governador(a)",        office: "governor" },
  { key: "presidente",        label: "Presidente",           office: "president" },
];

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

function encodeCola(type: ElectionType, general: GeneralMap, municipal: MunicipalMap): string {
  if (type === "gerais") {
    return btoa(encodeURIComponent(`G:${GENERAL_OFFICES.map(({ key }) => general[key]).join("|")}`));
  }
  return btoa(encodeURIComponent(`M:${MUNICIPAL_OFFICES.map(({ key }) => municipal[key]).join("|")}`));
}

function decodeCola(encoded: string): { type: ElectionType; general: GeneralMap; municipal: MunicipalMap } | null {
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
    return null;
  } catch {
    return null;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ColaEleitoralClient() {
  const searchParams    = useSearchParams();
  const previewRef      = useRef<HTMLDivElement>(null);
  const isAuthenticated = useIsAuthenticated();

  const [electionType, setElectionType] = useState<ElectionType>("gerais");
  const [showSenador2, setShowSenador2] = useState(false);
  const [general,  setGeneral]   = useState<GeneralMap>({ ...EMPTY_GENERAL });
  const [municipal, setMunicipal] = useState<MunicipalMap>({ ...EMPTY_MUNICIPAL });
  const [copied, setCopied]      = useState(false);
  const [filledFromFavorites, setFilledFromFavorites] = useState(false);

  const { data: follows = [] } = useFollows();

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
      const key = OFFICE_TO_GENERAL_KEY[f.politician.office];
      if (key && !update[key]) {
        const acronym = f.politician.party?.acronym;
        update[key] = acronym ? `${f.politician.name} (${acronym})` : f.politician.name;
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
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
                electionType === type ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "gerais" ? "Eleições Gerais" : "Eleições Municipais"}
            </button>
          ))}
        </div>

        {/* Fill from favorites */}
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
            <div key={key} className="rounded-xl border border-border bg-background p-4 transition-colors focus-within:border-border-strong">
              <label htmlFor={key} className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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

          {electionType === "gerais" && (
            <button
              onClick={() => {
                if (showSenador2) setGeneral((prev) => ({ ...prev, senador_2: "" }));
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

        {/* Progress */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: totalSlots > 0 ? `${(filledCount / totalSlots) * 100}%` : "0%" }}
            />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{filledCount}/{totalSlots} preenchidos</span>
        </div>

        {/* Preview */}
        {!isEmpty && (
          <div ref={previewRef} id="cola-preview" className="mt-8 overflow-hidden rounded-xl border-2 border-primary/30 bg-background">
            <div className="bg-primary px-6 py-4 text-center">
              <p className="text-lg font-bold text-primary-foreground">Minha Cola Eleitoral</p>
              <p className="text-sm text-primary-foreground/80">
                {electionType === "gerais" ? "Eleições Gerais" : "Eleições Municipais"} · Smart Politics
              </p>
            </div>
            <div className="divide-y divide-border p-2">
              {previewOffices.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
                  <span className="max-w-[60%] truncate text-right text-sm font-semibold text-foreground">{activeMap[key]}</span>
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
            {copied ? <><Check className="h-4 w-4 text-success" />Link copiado!</> : <><Copy className="h-4 w-4" />Copiar link</>}
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
          <a href="/cadastro" className="font-medium text-primary hover:text-primary/80">Criar conta grátis</a>
        </p>
      </div>
    </>
  );
}
