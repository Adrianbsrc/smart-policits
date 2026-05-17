"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Share2, Users } from "lucide-react";

import { useCandidate } from "@/hooks/use-candidate";
import { useMyMatchPercent } from "@/hooks/use-quiz";
import { useVotacoes } from "@/hooks/use-votacoes";
import { FollowButton } from "@/components/candidates/follow-button";
import { ScoreBar, ScoreRing } from "@/components/ui/score-bar";
import { OFFICE_LABELS, SCORE_LABELS_FULL, SCORE_MAIN_KEYS, SCORE_EXTENDED_KEYS } from "@/lib/content/labels";

interface Props {
  slug: string;
}

type Tab = "overview" | "scores" | "historico" | "propostas";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Visão Geral" },
  { id: "scores", label: "Scores" },
  { id: "historico", label: "Histórico" },
  { id: "propostas", label: "Propostas" },
];

const TSE_SOURCES = [
  { name: "TSE — Divulgação de Candidaturas", url: "https://divulgacandcontas.tse.jus.br" },
  { name: "Portal da Transparência — CGU", url: "https://transparencia.gov.br" },
  { name: "Câmara dos Deputados", url: "https://www.camara.leg.br" },
  { name: "Senado Federal", url: "https://www.senado.leg.br" },
];

function getShareUrl() {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.set("ref", "share");
  return url.toString();
}

async function shareProfile(name: string) {
  const url = getShareUrl();
  const text = `Conheça o perfil político de ${name} no Smart Politics!`;
  if (navigator.share) {
    try {
      await navigator.share({ title: name, text, url });
      return;
    } catch {
      // fall through to clipboard
    }
  }
  await navigator.clipboard.writeText(url);
}

function shareProfileWhatsApp(name: string) {
  const url = getShareUrl();
  const text = `Conheça o perfil político de *${name}* no Smart Politics!\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

export function CandidateProfileClient({ slug }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const searchParams = useSearchParams();
  const isSharedProfile = searchParams.get("ref") === "share";
  const { data: candidate, isLoading, isError } = useCandidate(slug);
  const matchPercent = useMyMatchPercent(candidate?.id ?? "");
  const isDeputado = candidate?.office === "federal_deputy";
  const hasRealTseId = Boolean(candidate?.tseId && /^\d+$/.test(candidate.tseId));
  const { data: votacoesData, isLoading: loadingVotacoes } = useVotacoes(
    slug,
    activeTab === "historico" && isDeputado && hasRealTseId,
  );

  if (isLoading) return <CandidateProfileSkeleton />;

  if (isError || !candidate) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-12 text-center">
        <p className="text-base font-medium text-destructive">Candidato não encontrado</p>
        <p className="mt-2 text-sm text-muted-foreground">
          O perfil pode ter sido removido ou o endereço está incorreto.
        </p>
        <Link href="/ranking" className="mt-4 inline-flex text-sm text-primary hover:underline">
          Ver todos os candidatos
        </Link>
      </div>
    );
  }

  const { name, office, state, photoUrl, party, score, bio } = candidate;

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name,
            description: bio,
            image: photoUrl,
            jobTitle: OFFICE_LABELS[office] ?? office,
            affiliation: party ? { "@type": "Organization", name: party.name } : undefined,
          }),
        }}
      />

      {/* Shared badge */}
      {isSharedProfile && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-primary">
          <Users className="h-4 w-4 shrink-0" />
          <span>Este perfil foi compartilhado com você.</span>
        </div>
      )}

      {/* Profile header */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
          {photoUrl ? (
            <Image src={photoUrl} alt={name} fill className="object-cover" sizes="80px" />
          ) : (
            <span aria-hidden="true">{name[0]}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{name}</h1>
            {party && (
              <span
                className="rounded-md px-2 py-0.5 text-sm font-bold text-white"
                style={{ backgroundColor: party.colorHex }}
              >
                {party.acronym}
              </span>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            {OFFICE_LABELS[office] ?? office}
            {state && ` · ${state}`}
          </p>
          {party && <p className="mt-1 text-sm text-muted-foreground">{party.name}</p>}
        </div>

        <div className="shrink-0">
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            {score ? (
              <ScoreRing score={score.overall} size={72} />
            ) : (
              <p className="text-4xl font-bold tabular-nums text-foreground">—</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">nota geral / 10</p>
            {matchPercent !== null && (
              <p className="mt-2 text-sm font-semibold tabular-nums text-primary">
                {matchPercent}%{" "}
                <span className="text-xs font-normal text-muted-foreground">match</span>
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <FollowButton candidateId={candidate.id} variant="full" className="flex-1 text-xs h-7 px-2" />
              <button
                onClick={() => void shareProfile(name)}
                className="inline-flex items-center justify-center rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Compartilhar perfil"
                title="Compartilhar link"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => shareProfileWhatsApp(name)}
                className="inline-flex items-center justify-center rounded-md bg-[#25D366] px-2 py-1.5 text-xs text-white transition-opacity hover:opacity-90"
                aria-label="Enviar via WhatsApp"
                title="Enviar via WhatsApp"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex overflow-x-auto gap-0 border-b border-border" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <OverviewTab score={score} bio={bio} party={party} />
      )}
      {activeTab === "scores" && (
        <ScoresTab score={score} />
      )}
      {activeTab === "historico" && (
        <HistoricoTab
          isDeputado={isDeputado}
          hasRealTseId={hasRealTseId}
          votacoes={votacoesData?.dados ?? []}
          isLoading={loadingVotacoes}
        />
      )}
      {activeTab === "propostas" && (
        <PropostasTab />
      )}
    </>
  );
}

// --- Sub-components ---

type Score = NonNullable<ReturnType<typeof useCandidate>["data"]>["score"];
type Party = NonNullable<ReturnType<typeof useCandidate>["data"]>["party"];

function OverviewTab({ score, bio, party }: { score: Score; bio: string | null; party: Party }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        {score && (
          <section className="rounded-xl border border-border bg-background p-5" aria-label="Scores principais">
            <h2 className="mb-4 text-base font-semibold text-foreground">Dimensões principais</h2>
            <div className="flex flex-col gap-3">
              {SCORE_MAIN_KEYS.map((key) => (
                <ScoreBar key={key} label={SCORE_LABELS_FULL[key]} score={score[key]} />
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-border bg-background p-5" aria-label="Sobre o candidato">
          <h2 className="mb-3 text-base font-semibold text-foreground">Sobre</h2>
          {bio ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">Biografia não disponível.</p>
          )}
        </section>
      </div>

      <div className="flex flex-col gap-4">
        {party && (
          <div className="rounded-xl border border-border bg-background p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Partido</h2>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: party.colorHex }}
              >
                {party.acronym.slice(0, 4)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{party.acronym}</p>
                <p className="text-xs text-muted-foreground">{party.name}</p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-background p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Fontes</h2>
          <div className="flex flex-col gap-2">
            {TSE_SOURCES.map(({ name, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80"
              >
                {name}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoresTab({ score }: { score: Score }) {
  if (!score) {
    return (
      <EmptyState message="Score não disponível para este candidato." />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-border bg-background p-5" aria-label="Dimensões principais">
        <h2 className="mb-1 text-base font-semibold text-foreground">Dimensões principais</h2>
        <p className="mb-4 text-xs text-muted-foreground">Peso 2× no score geral</p>
        <div className="flex flex-col gap-3">
          {SCORE_MAIN_KEYS.map((key) => (
            <ScoreBar key={key} label={SCORE_LABELS_FULL[key]} score={score[key]} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-background p-5" aria-label="Dimensões estendidas">
        <h2 className="mb-1 text-base font-semibold text-foreground">Dimensões estendidas</h2>
        <p className="mb-4 text-xs text-muted-foreground">Peso 1× no score geral</p>
        <div className="flex flex-col gap-3">
          {SCORE_EXTENDED_KEYS.map((key) => (
            <ScoreBar key={key} label={SCORE_LABELS_FULL[key]} score={score[key]} />
          ))}
        </div>
      </section>
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
  if (!isDeputado) {
    return <EmptyState message="Histórico de votações disponível apenas para Deputados Federais." />;
  }

  if (!hasRealTseId) {
    return <EmptyState message="Dados de votação não disponíveis para este deputado." />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (votacoes.length === 0) {
    return <EmptyState message="Nenhuma votação encontrada." />;
  }

  return (
    <section aria-label="Histórico de votações">
      <h2 className="mb-4 text-base font-semibold text-foreground">Votações recentes</h2>
      <ol className="flex flex-col gap-3">
        {votacoes.map((voto) => (
          <li key={voto.id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {voto.descricao || "Votação"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {voto.siglaOrgao} ·{" "}
                  {new Date(voto.dataHoraRegistro).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${
                  voto.tipoVoto === "Sim"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : voto.tipoVoto === "Não"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {voto.tipoVoto}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PropostasTab() {
  return (
    <EmptyState
      message="Em breve"
      detail="Integração com propostas legislativas em desenvolvimento."
    />
  );
}

function EmptyState({ message, detail }: { message: string; detail?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background py-16 text-center">
      <p className="text-sm font-medium text-foreground">{message}</p>
      {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

function CandidateProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 flex gap-6">
        <div className="h-20 w-20 shrink-0 rounded-2xl bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-7 w-56 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
        <div className="h-24 w-28 shrink-0 rounded-xl bg-muted" />
      </div>
      <div className="mb-6 h-10 rounded-lg bg-muted" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-52 rounded-xl bg-muted" />
          <div className="h-32 rounded-xl bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-24 rounded-xl bg-muted" />
          <div className="h-32 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
