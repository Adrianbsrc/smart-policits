"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FileText, Loader2, RefreshCw, Share2 } from "lucide-react";

import { useDeleteQuizResult, useSubmitQuiz } from "@/hooks/use-quiz";
import { ScoreBar } from "@/components/ui/score-bar";
import { Badge } from "@/components/ui/badge";
import type { QuizMatch, DimensionWeights } from "@/lib/api/types";
import { OFFICE_LABELS, SCORE_LABELS_FULL } from "@/lib/content/labels";

const DIMENSION_LABELS: Record<keyof DimensionWeights, string> = {
  education: "Educação",
  health: "Saúde",
  security: "Segurança",
  economy: "Economia",
  transparency: "Transparência",
  environment: "Meio Ambiente",
  infrastructure: "Infraestrutura",
  technology: "Tecnologia & Inovação",
  agriculture: "Agricultura & Agro",
  international: "Relações Internacionais",
  culture: "Cultura & Esporte",
  socialRights: "Direitos Sociais",
  entrepreneurship: "Empreendedorismo",
};

function getTopWeightBars(weights: DimensionWeights, topN = 8) {
  const maxVal = Math.max(...Object.values(weights));
  return (Object.entries(weights) as [keyof DimensionWeights, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([key, val]) => ({
      label: DIMENSION_LABELS[key] ?? SCORE_LABELS_FULL[key as keyof typeof SCORE_LABELS_FULL] ?? key,
      score: Math.round((val / maxVal) * 10 * 10) / 10,
    }));
}

function shareResult(topMatch?: { name: string; matchPercent: number }) {
  const url = window.location.href;
  const text = topMatch
    ? `Fiz o quiz político do Smart Politics e meu candidato mais alinhado é ${topMatch.name} com ${topMatch.matchPercent}% de match! Descubra o seu: ${url}`
    : `Fiz o quiz político do Smart Politics e descobri meu perfil eleitoral! Descubra o seu: ${url}`;

  if (navigator.share) {
    void navigator.share({ title: "Meu resultado no Smart Politics", text, url });
  } else {
    void navigator.clipboard.writeText(url).then(() => alert("Link copiado!"));
  }
}

function shareWhatsApp(topMatch?: { name: string; matchPercent: number }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = topMatch
    ? `Fiz o quiz político do Smart Politics e meu candidato mais alinhado é *${topMatch.name}* com *${topMatch.matchPercent}%* de match!\n\nDescubra o seu: ${url}`
    : `Descobri meu perfil político no Smart Politics!\n\nDescubra o seu: ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

function MatchCard({ match, rank }: { match: QuizMatch; rank: number }) {
  const office = OFFICE_LABELS[match.office as keyof typeof OFFICE_LABELS] ?? match.office;
  const isTop = rank === 1;

  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        isTop ? "border-primary/30 bg-primary/5" : "border-border bg-background"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            isTop ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{match.name}</h3>
            {isTop && <Badge variant="primary" size="sm">Melhor match</Badge>}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {match.party?.acronym ?? "—"} · {office}
            {match.state ? ` · ${match.state}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold tabular-nums">{match.matchPercent}%</p>
          <p className="text-xs text-muted-foreground">match</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
            {match.score.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground">nota</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <Link
          href={`/candidato/${match.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
        >
          Ver perfil completo
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function QuizResultClient() {
  const { mutate: submitQuiz, data: result, isPending, isError } = useSubmitQuiz();
  const { mutate: deleteResult, isPending: isDeleting } = useDeleteQuizResult();
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (submitted) return;

    const raw = sessionStorage.getItem("quiz_answers");
    if (!raw) return;

    let answers: Record<string, string>;
    try {
      answers = JSON.parse(raw) as Record<string, string>;
    } catch {
      return;
    }

    setSubmitted(true);
    submitQuiz(answers);
  }, [submitQuiz, submitted]);

  function handleRetake() {
    sessionStorage.removeItem("quiz_answers");
    deleteResult(undefined, {
      onSuccess: () => router.push("/quiz"),
    });
  }

  if (isPending || !result) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center">
        {isPending ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Calculando seu alinhamento político...</p>
          </>
        ) : isError ? (
          <>
            <p className="font-semibold text-foreground">Não foi possível carregar o resultado.</p>
            <Link href="/quiz" className="text-sm text-primary hover:text-primary/80">
              Refazer o quiz
            </Link>
          </>
        ) : (
          <>
            <p className="font-semibold text-foreground">Nenhuma resposta encontrada.</p>
            <Link href="/quiz" className="text-sm text-primary hover:text-primary/80">
              Fazer o quiz
            </Link>
          </>
        )}
      </div>
    );
  }

  const scoreBars = getTopWeightBars(result.weights);
  const topMatch = result.matches[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background-subtle px-4 py-1.5 text-sm text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Análise concluída
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Seu perfil político
        </h1>
        <p className="mt-3 text-muted-foreground">
          Com base nas suas respostas, identificamos seus candidatos mais alinhados.
        </p>
      </div>

      {/* User score weights — top 8 themes */}
      <div className="mb-10 rounded-xl border border-border bg-background p-6">
        <h2 className="mb-1 text-base font-semibold text-foreground">Suas prioridades por tema</h2>
        <p className="mb-4 text-xs text-muted-foreground">Os 8 temas com maior peso nas suas respostas</p>
        <div className="flex flex-col gap-3">
          {scoreBars.map(({ label, score }) => (
            <ScoreBar key={label} label={label} score={score} />
          ))}
        </div>
      </div>

      {/* Top matches */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-foreground">Seus candidatos mais alinhados</h2>
        <div className="flex flex-col gap-4">
          {result.matches.slice(0, 5).map((match, i) => (
            <MatchCard key={match.candidateId} match={match} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/cadastro"
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-center transition-all hover:border-border-strong hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="text-lg">👤</span>
          </div>
          <p className="text-sm font-semibold text-foreground">Criar conta</p>
          <p className="text-xs text-muted-foreground">Salve seu resultado e acompanhe candidatos</p>
        </Link>
        <Link
          href="/cola-eleitoral"
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-center transition-all hover:border-border-strong hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
            <FileText className="h-5 w-5 text-success" />
          </div>
          <p className="text-sm font-semibold text-foreground">Cola eleitoral</p>
          <p className="text-xs text-muted-foreground">Monte sua lista de candidatos favoritos</p>
        </Link>
      </div>

      {/* Share CTAs */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() => shareResult(topMatch)}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-all hover:border-border-strong hover:shadow-sm"
          aria-label="Compartilhar resultado"
        >
          <Share2 className="h-4 w-4 text-muted-foreground" />
          Compartilhar resultado
        </button>
        <button
          onClick={() => shareWhatsApp(topMatch)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          aria-label="Enviar via WhatsApp"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Enviar via WhatsApp
        </button>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 text-center">
        <Link href="/ranking" className="text-sm font-medium text-primary hover:text-primary/80">
          Ver ranking completo →
        </Link>
        <button
          onClick={handleRetake}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refazer o quiz
        </button>
      </div>
    </div>
  );
}
