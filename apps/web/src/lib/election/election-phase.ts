/**
 * Máquina de estados do ciclo eleitoral (docs/SPECs/home.md#estratégia-para-períodos-eleitorais).
 * Fonte única da data da próxima eleição — antes hardcoded dentro de
 * hero-section.tsx. Função pura, sem I/O, para ser testável isoladamente.
 */

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

/** Data/hora da próxima eleição (fuso de Brasília). */
export const ELECTION_DATE = new Date("2026-10-04T00:00:00-03:00");

/** Dias a partir dos quais o ciclo deixa de ser "distante" e passa a "se aproximando". */
const APPROACHING_THRESHOLD_DAYS = 90;

export type ElectionPhase = "distant" | "approaching" | "election_day" | "post_election";

export interface ElectionPhaseInfo {
  phase: ElectionPhase;
  /** Dias restantes (negativo após a eleição). */
  daysUntil: number;
  label: string;
}

/**
 * Resolve a fase do ciclo eleitoral a partir da distância até `electionDate`.
 * Cobre as 4 fases previstas na SPEC; o copy de cada fase pode evoluir
 * depois sem mudar esta estrutura.
 */
export function resolveElectionPhase(now: Date, electionDate: Date = ELECTION_DATE): ElectionPhaseInfo {
  const diffMs = electionDate.getTime() - now.getTime();
  const daysUntil = Math.ceil(diffMs / ONE_DAY_MS);

  if (diffMs > APPROACHING_THRESHOLD_DAYS * ONE_DAY_MS) {
    return { phase: "distant", daysUntil, label: `Eleições 2026 · ${daysUntil} dias` };
  }
  if (diffMs > 0) {
    return { phase: "approaching", daysUntil, label: "Eleições se aproximando" };
  }
  if (diffMs > -ONE_DAY_MS) {
    return { phase: "election_day", daysUntil: 0, label: "Hoje é dia da eleição" };
  }
  return { phase: "post_election", daysUntil, label: "Acompanhe o mandato" };
}
