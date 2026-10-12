"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Share2, Users, ShieldCheck, ShieldAlert, ShieldX, TrendingUp, TrendingDown, GitCompare, ThumbsUp, ThumbsDown, Minus, ChevronRight } from "lucide-react";

import { usePolitician } from "@/hooks/use-politician";
import { useMyMatchPercent } from "@/hooks/use-quiz";
import { useVotacoes } from "@/hooks/use-votacoes";
import { useTimeline } from "@/hooks/use-timeline";
import { useScoreEvidence } from "@/hooks/use-score-history";
import { useExpensesSummary, useExpenses } from "@/hooks/use-expenses";
import { FollowButton } from "@/components/politicians/follow-button";
import { ScoreBar } from "@/components/ui/score-bar";
import { ScoreRing as ScoreRingNew } from "@/components/ui/score-ring";
import { GlassCard } from "@/components/ui/glass-card";
import { LiqPill } from "@/components/ui/liq-pill";
import { AdSlot } from "@/components/ui/ad-slot";
import { OFFICE_LABELS, SCORE_LABELS_FULL, SCORE_MAIN_KEYS, SCORE_EXTENDED_KEYS } from "@/lib/content/labels";
import type { PoliticianScore, PenaltyRecord, ScoreBreakdown, PoliticalEvent, ScoreEvidence as ScoreEvidenceType, PublicExpense, ExpenseSummary } from "@/lib/api/types";
import { Routes } from "@/routes";
import { buildPersonJsonLd } from "@/lib/seo";
import { JsonLdScript } from "@/components/seo/json-ld-script";

interface Props { slug: string }
type Tab = "overview" | "scores" | "timeline" | "historico" | "gastos" | "propostas";

const ALL_TABS: { id: Tab; label: string; legislatorsOnly?: boolean }[] = [
  { id: "overview",  label: "Visão Geral" },
  { id: "scores",    label: "Avaliação" },
  { id: "timeline",  label: "Linha do Tempo" },
  { id: "historico", label: "Histórico de Votações", legislatorsOnly: true },
  { id: "gastos",    label: "Gastos" },
  { id: "propostas", label: "Propostas" },
];

const LEGISLATOR_OFFICES = new Set(["federal_deputy", "senator", "state_deputy"]);

const TSE_SOURCES = [
  { name: "TSE — Divulgação de Candidaturas", url: "https://divulgacandcontas.tse.jus.br" },
  { name: "Portal da Transparência — CGU",    url: "https://transparencia.gov.br" },
  { name: "Câmara dos Deputados",             url: "https://www.camara.leg.br" },
  { name: "Senado Federal",                   url: "https://www.senado.leg.br" },
];

/** 5 pilares exibidos no perfil */
const PILLARS = [
  { key: "transparency"   as const, bdKey: "transparency"   as const, label: "Transparência", desc: "Declaração de bens, agenda e gastos" },
  { key: "activity"       as const, bdKey: "activity"       as const, label: "Presença",       desc: "Frequência em votações e comissões" },
  { key: "constitutional" as const, bdKey: "constitutional" as const, label: "Coerência",      desc: "Alinhamento entre discurso e voto" },
  { key: "integrity"      as const, bdKey: null,                       label: "Integridade",    desc: "Ficha criminal, processos e condenações" },
  { key: "thematic"       as const, bdKey: "thematic"       as const, label: "Produtividade",  desc: "Projetos apresentados e aprovados" },
] as const;

function getPillarValue(score: PoliticianScore, bdKey: string | null, key: string): number {
  if (score.scoreType === "mock") return 0;
  if (key === "integrity") return Math.min(10, score.integrityMultiplier * 10);
  const bd = score.breakdown as Record<string, number> | null;
  if (bdKey && bd?.[bdKey] !== undefined) return bd[bdKey]!;
  return (score as unknown as Record<string, number>)[key] ?? 0;
}

function getShareUrl() {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.set("ref", "share");
  return url.toString();
}

async function shareProfile(name: string) {
  const url = getShareUrl();
  const text = `Conheça o perfil político de ${name} no Smart Politics!`;
  if (navigator.share) { try { await navigator.share({ title: name, text, url }); return; } catch { /* fall through */ } }
  await navigator.clipboard.writeText(url);
}

function shareProfileWhatsApp(name: string) {
  const url = getShareUrl();
  window.open(`https://wa.me/?text=${encodeURIComponent(`Conheça o perfil de *${name}* no Smart Politics!\n${url}`)}`, "_blank", "noopener");
}

// ─── Main component ─────────────────────────────────────────────────────────

export function PoliticianProfileClient({ slug }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const searchParams = useSearchParams();
  const isSharedProfile = searchParams.get("ref") === "share";

  const { data: politician, isLoading, isError } = usePolitician(slug);
  const matchPercent = useMyMatchPercent(politician?.id ?? "");
  const isLegislator = LEGISLATOR_OFFICES.has(politician?.office ?? "");
  const isDeputado = politician?.office === "federal_deputy";
  const hasRealTseId = Boolean(politician?.tseId && /^\d+$/.test(politician.tseId));
  const tabs = ALL_TABS.filter((t) => !t.legislatorsOnly || isLegislator);
  const { data: votacoesData, isLoading: loadingVotacoes } = useVotacoes(
    slug,
    activeTab === "historico" && isDeputado && hasRealTseId,
  );
  const { data: timelineData, isLoading: loadingTimeline } = useTimeline(slug, {
    enabled: activeTab === "timeline",
  });
  const { data: scoreEvidences, isLoading: loadingEvidence } = useScoreEvidence(
    slug,
    undefined,
    activeTab === "scores",
  );
  const { data: expenseSummary, isLoading: loadingExpenseSummary } = useExpensesSummary(
    slug,
    undefined,
    activeTab === "gastos",
  );
  const { data: expensesData, isLoading: loadingExpenses } = useExpenses(
    slug,
    undefined,
    activeTab === "gastos",
  );

  if (isLoading) return <PoliticianProfileSkeleton />;

  if (isError || !politician) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-12 text-center">
        <p className="text-base font-medium text-destructive">Político não encontrado</p>
        <p className="mt-2 text-sm text-muted-foreground">O perfil pode ter sido removido ou o endereço está incorreto.</p>
        <Link href={Routes.ranking()} className="mt-4 inline-flex text-sm text-primary hover:underline">Ver todos os políticos</Link>
      </div>
    );
  }

  const { name, office, state, photoUrl, party, score, bio } = politician;
  const isMock    = !score || score.scoreType === "mock";
  const fichaLimpa = !(politician as { fichaLimpaIneligible?: boolean }).fichaLimpaIneligible;

  return (
    <>
      <JsonLdScript
        data={buildPersonJsonLd({
          name,
          path: Routes.legacyPoliticianProfile(slug),
          ...(bio && { description: bio }),
          ...(photoUrl && { image: photoUrl }),
          jobTitle: OFFICE_LABELS[office] ?? office,
          ...(party && { affiliation: party.name }),
        })}
      />

      {/* Breadcrumb + actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link href={Routes.ranking()} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Ranking
        </Link>
        <Link
          href={Routes.compareStart(slug)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <GitCompare className="h-3.5 w-3.5" />
          Comparar
        </Link>
      </div>

      {/* Shared badge */}
      {isSharedProfile && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-primary">
          <Users className="h-4 w-4 shrink-0" />
          <span>Este perfil foi compartilhado com você.</span>
        </div>
      )}

      {/* ── Profile header ──────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        {/* Avatar */}
        <IntegrityAvatar name={name} photoUrl={photoUrl} integrityMultiplier={score?.integrityMultiplier} />

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{name}</h1>
            {party && (
              <span className="rounded-md px-2 py-0.5 text-sm font-bold text-white" style={{ backgroundColor: party.colorHex }}>
                {party.acronym}
              </span>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            {OFFICE_LABELS[office] ?? office}
            {state && ` · ${state}`}
          </p>
          {party && <p className="mt-0.5 text-sm text-muted-foreground">{party.name}</p>}

          {/* Badges */}
          <div className="mt-2 flex flex-wrap gap-2">
            {fichaLimpa && (
              <LiqPill tone="good">
                <ShieldCheck className="h-3 w-3" />
                Ficha limpa
              </LiqPill>
            )}
            {matchPercent !== null && (
              <LiqPill tone="accent">
                {matchPercent}% match com você
              </LiqPill>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FollowButton candidateId={politician.id} variant="full" className="h-8 text-xs px-3" />
            <button
              onClick={() => void shareProfile(name)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Compartilhar perfil"
            >
              <Share2 className="h-3.5 w-3.5" />
              Compartilhar
            </button>
            <button
              onClick={() => shareProfileWhatsApp(name)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#25D366] px-3 text-xs text-white hover:opacity-90 transition-opacity"
              aria-label="Enviar via WhatsApp"
            >
              <WaIcon />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Score card */}
        <GlassCard className="shrink-0 min-w-[140px] text-center">
          <ScoreRingNew value={isMock ? null : score?.overall ?? null} size={80} stroke={6} showLabel />
          <p className="mt-2 text-xs text-muted-foreground">
            {isMock ? "Dados em coleta" : "Nota geral / 10"}
          </p>
        </GlassCard>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="glass-strong mb-6 rounded-[16px] px-1 py-1" role="tablist">
        <div className="flex overflow-x-auto gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-[12px] px-4 py-2 text-[13px] font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────── */}
      {activeTab === "overview"  && <OverviewTab  score={score} bio={bio} party={party} isMock={isMock} />}
      {activeTab === "scores"    && (
        <ScoresTab score={score} isMock={isMock} evidences={scoreEvidences ?? []} loadingEvidence={loadingEvidence} />
      )}
      {activeTab === "timeline"  && (
        <TimelineTab events={timelineData?.data ?? []} isLoading={loadingTimeline} total={timelineData?.meta.total ?? 0} />
      )}
      {activeTab === "historico" && (
        <HistoricoTab
          isDeputado={isDeputado}
          hasRealTseId={hasRealTseId}
          votacoes={votacoesData?.dados ?? []}
          isLoading={loadingVotacoes}
        />
      )}
      {activeTab === "gastos" && (
        <GastosTab
          summary={expenseSummary}
          expenses={expensesData?.data ?? []}
          isLoading={loadingExpenseSummary || loadingExpenses}
        />
      )}
      {activeTab === "propostas" && <PropostasTab score={score} />}
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

type Score = NonNullable<ReturnType<typeof usePolitician>["data"]>["score"];
type Party = NonNullable<ReturnType<typeof usePolitician>["data"]>["party"];

function IntegrityAvatar({ name, photoUrl, integrityMultiplier }: { name: string; photoUrl: string | null; integrityMultiplier?: number }) {
  const borderColor =
    integrityMultiplier == null ? "var(--border)"
    : integrityMultiplier >= 1.0 ? "var(--success)"
    : integrityMultiplier >= 0.7 ? "var(--warning)"
    : "var(--destructive)";

  return (
    <div
      className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-2xl font-bold text-primary"
      style={{ boxShadow: `0 0 0 3px ${borderColor}` }}
    >
      {photoUrl ? (
        <Image src={photoUrl} alt={name} fill className="object-cover" sizes="80px" />
      ) : (
        <span aria-hidden="true">{name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}</span>
      )}
    </div>
  );
}

function PillarBar({ label, desc, value }: { label: string; desc: string; value: number }) {
  const pct   = Math.min(100, Math.max(0, (value / 10) * 100));
  const color = value >= 7 ? "bg-success" : value >= 4 ? "bg-warning" : value > 0 ? "bg-destructive" : "bg-muted";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-foreground">{label}</span>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <span className="shrink-0 text-lg font-bold tabular-nums text-foreground">{value.toFixed(0)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function OverviewTab({ score, bio, party, isMock }: { score: Score; bio: string | null; party: Party; isMock: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main column */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        {/* Sobre */}
        <GlassCard>
          <h2 className="mb-3 text-base font-semibold text-foreground">Sobre</h2>
          {bio ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">Biografia não disponível.</p>
          )}
        </GlassCard>

        {/* Fontes e partido */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {party && (
            <GlassCard>
              <h2 className="mb-3 text-sm font-semibold text-foreground">Partido</h2>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-xs font-bold text-white"
                  style={{ backgroundColor: party.colorHex }}
                >
                  {party.acronym.slice(0, 4)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{party.acronym}</p>
                  <p className="text-xs text-muted-foreground">{party.name}</p>
                </div>
              </div>
            </GlassCard>
          )}
          <GlassCard>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Fontes de dados</h2>
            <div className="flex flex-col gap-2">
              {TSE_SOURCES.map(({ name, url }) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80">
                  {name} <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Sidebar: 5 pillars */}
      <div className="flex flex-col gap-4">
        <GlassCard>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Os cinco pilares</h2>
            <Link href={Routes.methodology()} className="text-xs text-primary hover:underline">metodologia →</Link>
          </div>
          {isMock ? (
            <div className="rounded-xl bg-muted/50 px-3 py-4 text-center">
              <p className="text-xs text-muted-foreground">Dados reais em coleta.</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                Scores serão disponibilizados quando os dados forem verificados.
              </p>
            </div>
          ) : score ? (
            <div className="flex flex-col gap-4">
              {PILLARS.map((p) => (
                <PillarBar
                  key={p.key}
                  label={p.label}
                  desc={p.desc}
                  value={getPillarValue(score, p.bdKey, p.key)}
                />
              ))}
            </div>
          ) : null}
        </GlassCard>

        <AdSlot
          slot="profile-sidebar"
          format="rectangle"
          note="300 × 250 · retângulo · sidebar do perfil"
        />
      </div>
    </div>
  );
}

function IntegrityBadge({ multiplier }: { multiplier: number }) {
  if (multiplier >= 1.0) return (
    <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2">
      <ShieldCheck className="h-5 w-5 text-success" />
      <div>
        <p className="text-sm font-semibold text-success">Sem penalidades</p>
        <p className="text-xs text-success/80">Multiplicador: {multiplier.toFixed(2)}×</p>
      </div>
    </div>
  );
  if (multiplier >= 0.7) return (
    <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2">
      <ShieldAlert className="h-5 w-5 text-warning" />
      <div>
        <p className="text-sm font-semibold text-warning">Penalidades leves</p>
        <p className="text-xs text-warning/80">Multiplicador: {multiplier.toFixed(2)}×</p>
      </div>
    </div>
  );
  return (
    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
      <ShieldX className="h-5 w-5 text-destructive" />
      <div>
        <p className="text-sm font-semibold text-destructive">Penalidades graves</p>
        <p className="text-xs text-destructive/80">Multiplicador: {multiplier.toFixed(2)}×</p>
      </div>
    </div>
  );
}

function ScoresTab({
  score,
  isMock,
  evidences,
  loadingEvidence,
}: {
  score: Score;
  isMock: boolean;
  evidences: ScoreEvidenceType[];
  loadingEvidence: boolean;
}) {
  if (!score || isMock) {
    return <EmptyState message="Dados reais em coleta." detail="Este político ainda não possui dados verificados para pontuação." />;
  }

  const topDimension  = SCORE_EXTENDED_KEYS.reduce((best, key) =>
    (score[key] ?? 0) > (score[best] ?? 0) ? key : best, SCORE_EXTENDED_KEYS[0]);
  const worstDimension = SCORE_EXTENDED_KEYS.reduce((worst, key) =>
    (score[key] ?? 10) < (score[worst] ?? 10) ? key : worst, SCORE_EXTENDED_KEYS[0]);

  return (
    <div className="flex flex-col gap-6">
      {/* Score summary */}
      <GlassCard>
        <h2 className="mb-4 text-base font-semibold text-foreground">Score 2.0</h2>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="font-display text-2xl font-bold tabular-nums text-foreground">{score.overall.toFixed(1)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Score final</p>
          </div>
          {score.breakdown && (
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="font-display text-2xl font-bold tabular-nums text-foreground">{score.breakdown.baseScore.toFixed(1)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Base (antes integridade)</p>
            </div>
          )}
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="font-display text-2xl font-bold tabular-nums text-foreground">{score.integrityMultiplier.toFixed(2)}×</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Multiplicador integridade</p>
          </div>
        </div>
        <IntegrityBadge multiplier={score.integrityMultiplier} />
      </GlassCard>

      {/* Penalidades */}
      {score.penalties?.length > 0 && (
        <GlassCard accentColor="var(--destructive)">
          <h2 className="mb-3 text-base font-semibold text-foreground">Penalidades registradas</h2>
          <div className="flex flex-col gap-2">
            {score.penalties.map((p, i) => <PenaltyBadge key={i} penalty={p} />)}
          </div>
        </GlassCard>
      )}

      {/* Pilares estruturais */}
      {score.breakdown && (
        <GlassCard>
          <h2 className="mb-1 text-base font-semibold text-foreground">Pilares estruturais</h2>
          <p className="mb-4 text-xs text-muted-foreground">Componentes da nota base (antes do multiplicador de integridade)</p>
          <div className="flex flex-col gap-3">
            <BreakdownBar label="Transparência (20%)"          value={score.breakdown.transparency} />
            <BreakdownBar label="Presença (20%)"               value={score.breakdown.activity} />
            <BreakdownBar label="Coerência (20%)"              value={score.breakdown.constitutional} />
            <BreakdownBar label="Responsabilidade Fiscal (15%)" value={score.breakdown.fiscal} />
            <BreakdownBar label="Impacto Temático (25%)"       value={score.breakdown.thematic} />
          </div>
          {(score.breakdown.presenceRate != null || score.breakdown.billsProposed != null) && (
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
              {score.breakdown.presenceRate != null && (
                <StatCard label="Presença" value={`${(score.breakdown.presenceRate * 100).toFixed(0)}%`} />
              )}
              {score.breakdown.billsProposed != null && (
                <StatCard label="Projetos propostos" value={String(score.breakdown.billsProposed)} />
              )}
              {score.breakdown.billsApproved != null && (
                <StatCard label="Projetos aprovados" value={String(score.breakdown.billsApproved)} />
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* Dimensões temáticas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-1 text-base font-semibold text-foreground">Dimensões principais</h2>
          <p className="mb-4 text-xs text-muted-foreground">Peso 2× no score temático</p>
          <div className="flex flex-col gap-3">
            {SCORE_MAIN_KEYS.map((key) => <ScoreBar key={key} label={SCORE_LABELS_FULL[key]} score={score[key]} />)}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-1 text-base font-semibold text-foreground">Dimensões estendidas</h2>
          <p className="mb-4 text-xs text-muted-foreground">Peso 1× no score temático</p>
          <div className="flex flex-col gap-3">
            {SCORE_EXTENDED_KEYS.map((key) => <ScoreBar key={key} label={SCORE_LABELS_FULL[key]} score={score[key]} />)}
          </div>
        </GlassCard>
      </div>

      {/* Top/worst */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/5 p-3">
          <TrendingUp className="h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="text-xs text-muted-foreground">Melhor dimensão</p>
            <p className="text-sm font-semibold text-success">{SCORE_LABELS_FULL[topDimension]}</p>
            <p className="text-xs font-bold tabular-nums text-success">{score[topDimension].toFixed(1)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
          <TrendingDown className="h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-xs text-muted-foreground">Dimensão mais fraca</p>
            <p className="text-sm font-semibold text-destructive">{SCORE_LABELS_FULL[worstDimension]}</p>
            <p className="text-xs font-bold tabular-nums text-destructive">{score[worstDimension].toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Fontes institucionais */}
      <GlassCard>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Fontes utilizadas</h2>
          <Link href={Routes.methodology()} className="text-xs text-primary hover:underline">ver metodologia →</Link>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Todos os dados desta avaliação são extraídos exclusivamente de fontes institucionais oficiais.
          Fontes jornalísticas e agências de fact-checking são rejeitadas para garantir imparcialidade.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "STN/SIAFI — Resultado Fiscal",   url: "https://www.tesouronacional.gov.br" },
            { label: "TCU — Acórdãos e Auditorias",    url: "https://www.tcu.gov.br" },
            { label: "CNJ Datajud — Processos",         url: "https://datajud.cnj.jus.br" },
            { label: "TSE — Candidaturas e Bens",       url: "https://divulgacandcontas.tse.jus.br" },
            { label: "IBGE PNAD — Indicadores Sociais", url: "https://www.ibge.gov.br" },
            { label: "INPE PRODES — Desmatamento",      url: "https://prodes.inpe.br" },
            { label: "Portal da Transparência (CGU)",   url: "https://transparencia.gov.br" },
          ].map(({ label, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {label} <ExternalLink className="h-2.5 w-2.5 shrink-0" />
            </a>
          ))}
        </div>
      </GlassCard>

      {/* Score evidence */}
      <GlassCard>
        <h2 className="mb-1 text-base font-semibold text-foreground">Rastreabilidade do Score</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Eventos políticos que influenciaram cada dimensão da avaliação
        </p>
        {loadingEvidence ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : evidences.length === 0 ? (
          <p className="text-sm italic text-muted-foreground/60">Nenhuma evidência de score registrada ainda.</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {evidences.map((ev) => (
              <li key={ev.id} className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {ev.dimension}
                      </span>
                      <span className={`text-xs font-bold tabular-nums ${ev.deltaValue > 0 ? "text-success" : ev.deltaValue < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                        {ev.deltaValue > 0 ? "+" : ""}{ev.deltaValue.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{ev.explanation}</p>
                    {ev.event && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                        {ev.event.title.slice(0, 80)} · {new Date(ev.event.eventDate).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  {ev.event?.sourceUrl && (
                    <a href={ev.event.sourceUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </GlassCard>
    </div>
  );
}

function PenaltyBadge({ penalty }: { penalty: PenaltyRecord }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/10 bg-destructive/5 px-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{penalty.reason}</p>
        <p className="text-xs text-muted-foreground">{penalty.source}</p>
      </div>
      <span className="shrink-0 rounded px-2 py-0.5 text-xs font-bold text-destructive">
        -{(penalty.penalty * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, (value / 10) * 100));
  const color = value >= 7 ? "bg-success" : value >= 5 ? "bg-warning" : "bg-destructive";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-foreground">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  vote:           "Votação",
  bill_proposed:  "Projeto proposto",
  bill_approved:  "Projeto aprovado",
  investigation:  "Investigação",
  decree:         "Decreto",
  public_expense: "Gasto público",
  statement:      "Declaração",
};

function SentimentIcon({ sentiment }: { sentiment: number }) {
  if (sentiment > 0) return <ThumbsUp className="h-3.5 w-3.5 text-success" />;
  if (sentiment < 0) return <ThumbsDown className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function sentimentDotColor(sentiment: number) {
  if (sentiment > 0) return "bg-success";
  if (sentiment < 0) return "bg-destructive";
  return "bg-muted-foreground";
}

function TimelineTab({
  events,
  isLoading,
  total,
}: {
  events: PoliticalEvent[];
  isLoading: boolean;
  total: number;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        message="Nenhum evento registrado ainda."
        detail="Os eventos políticos serão exibidos aqui conforme forem sincronizados."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Linha do Tempo</h2>
        <span className="text-xs text-muted-foreground">{total} evento{total !== 1 ? "s" : ""}</span>
      </div>
      <ol className="relative flex flex-col gap-0 border-l border-border pl-4">
        {events.map((ev) => (
          <li key={ev.id} className="relative mb-6 last:mb-0">
            {/* dot */}
            <span
              className={`absolute -left-[1.15rem] top-1.5 h-3 w-3 rounded-full ring-2 ring-background ${sentimentDotColor(ev.sentiment)}`}
              aria-hidden="true"
            />
            <div className="glass rounded-2xl p-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {EVENT_TYPE_LABELS[ev.type] ?? ev.type}
                </span>
                <SentimentIcon sentiment={ev.sentiment} />
                <span className="text-[10px] text-muted-foreground">
                  {new Date(ev.eventDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                {ev.impact >= 7 && (
                  <span className="rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                    Alto impacto
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground">{ev.title}</p>
              {ev.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{ev.description}</p>
              )}
              {ev.topics.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {ev.topics.slice(0, 4).map((t) => (
                    <span key={t} className="rounded-full bg-primary/5 px-2 py-0.5 text-[10px] text-primary">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {ev.evidences.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {ev.evidences.map((e) => (
                    <span
                      key={e.dimension}
                      className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        e.deltaValue > 0 ? "bg-success/10 text-success" : e.deltaValue < 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {e.dimension} {e.deltaValue > 0 ? "+" : ""}{e.deltaValue.toFixed(1)}
                    </span>
                  ))}
                </div>
              )}
              {ev.sourceUrl && (
                <a
                  href={ev.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                >
                  {ev.sourceLabel ?? "Fonte"} <ChevronRight className="h-3 w-3" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

interface HistoricoTabProps {
  isDeputado: boolean;
  hasRealTseId: boolean;
  votacoes: import("@/lib/api/types").CamaraVoto[];
  isLoading: boolean;
}

function HistoricoTab({ isDeputado, hasRealTseId, votacoes, isLoading }: HistoricoTabProps) {
  if (!isDeputado)    return <EmptyState message="Histórico de votações disponível apenas para Deputados Federais." />;
  if (!hasRealTseId)  return <EmptyState message="Dados de votação não disponíveis para este deputado." />;
  if (isLoading)      return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
    </div>
  );
  if (votacoes.length === 0) return <EmptyState message="Nenhuma votação encontrada." />;

  return (
    <section aria-label="Histórico de votações">
      <h2 className="mb-4 text-base font-semibold text-foreground">Votações recentes</h2>
      <ol className="flex flex-col gap-3">
        {votacoes.map((voto) => (
          <li key={voto.id} className="glass rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{voto.descricao || "Votação"}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {voto.siglaOrgao} · {new Date(voto.dataHoraRegistro).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${
                voto.tipoVoto === "Sim" ? "bg-success/10 text-success"
                : voto.tipoVoto === "Não" ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
              }`}>
                {voto.tipoVoto}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  travel:      "Viagens",
  office:      "Escritório",
  fuel:        "Combustível",
  consultancy: "Consultoria",
  publicity:   "Publicidade",
  other:       "Outros",
};

function GastosTab({
  summary,
  expenses,
  isLoading,
}: {
  summary: ExpenseSummary | undefined;
  expenses: PublicExpense[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!summary || (summary.totalBrl === 0 && expenses.length === 0)) {
    return (
      <EmptyState
        message="Nenhum gasto público registrado."
        detail="Os gastos declarados via Portal da Transparência e CEAP serão exibidos aqui."
      />
    );
  }

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col gap-6">
      {/* Resumo anual */}
      {summary && (
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Resumo {summary.year}</h2>
            <span className="text-xs text-muted-foreground">
              Fonte: Portal da Transparência (CGU) · CEAP
            </span>
          </div>
          <div className="mb-4 rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-foreground">{fmt(summary.totalBrl)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Total gasto no ano</p>
          </div>
          {summary.byCategory.length > 0 && (
            <div className="flex flex-col gap-2">
              {summary.byCategory
                .sort((a, b) => b.totalBrl - a.totalBrl)
                .map(({ category, totalBrl, count }) => {
                  const pct = summary.totalBrl > 0 ? (totalBrl / summary.totalBrl) * 100 : 0;
                  return (
                    <div key={category}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-sm text-foreground">
                          {EXPENSE_CATEGORY_LABELS[category] ?? category}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {fmt(totalBrl)} · {count} lançamento{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </GlassCard>
      )}

      {/* Lista de gastos */}
      {expenses.length > 0 && (
        <GlassCard>
          <h2 className="mb-4 text-base font-semibold text-foreground">Lançamentos</h2>
          <ol className="flex flex-col gap-3">
            {expenses.map((e) => (
              <li key={e.id} className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {EXPENSE_CATEGORY_LABELS[e.category] ?? e.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(e.expenseDate).toLocaleDateString("pt-BR", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{e.description}</p>
                    {e.supplier && (
                      <p className="mt-0.5 text-xs text-muted-foreground">Fornecedor: {e.supplier}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-foreground">{fmt(e.amountBrl)}</p>
                    {e.documentUrl && (
                      <a
                        href={e.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline"
                      >
                        Comprovante <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </GlassCard>
      )}
    </div>
  );
}

function PropostasTab({ score }: { score: Score }) {
  if (!score?.breakdown) {
    return <EmptyState message="Dados em coleta" detail="Integração com propostas legislativas em desenvolvimento." />;
  }

  const { billsProposed = 0, billsApproved = 0, presenceRate } = score.breakdown;
  return (
    <div className="flex flex-col gap-6">
      <GlassCard>
        <h2 className="mb-4 text-base font-semibold text-foreground">Atividade legislativa</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Projetos propostos" value={String(billsProposed)} />
          <StatCard label="Projetos aprovados"  value={String(billsApproved)} />
          {presenceRate != null && <StatCard label="Taxa de presença" value={`${(presenceRate * 100).toFixed(0)}%`} />}
        </div>
      </GlassCard>
      <EmptyState message="Detalhes em breve" detail="Lista detalhada de projetos será exibida aqui." />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-4 text-center">
      <p className="font-display text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyState({ message, detail }: { message: string; detail?: string }) {
  return (
    <GlassCard className="flex flex-col items-center gap-2 py-16 text-center">
      <p className="text-sm font-medium text-foreground">{message}</p>
      {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
    </GlassCard>
  );
}

function PoliticianProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="h-20 w-20 shrink-0 rounded-2xl bg-muted" />
        <div className="min-w-0 flex-1 space-y-3 pt-1">
          <div className="h-7 w-64 rounded bg-muted" />
          <div className="h-4 w-36 rounded bg-muted" />
          <div className="h-8 w-48 rounded bg-muted" />
        </div>
        <div className="h-32 w-36 shrink-0 rounded-xl bg-muted" />
      </div>
      <div className="mb-6 h-10 rounded-lg bg-muted" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-32 rounded-xl bg-muted" />
          <div className="h-24 rounded-xl bg-muted" />
        </div>
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

function WaIcon() {
  return (
    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
