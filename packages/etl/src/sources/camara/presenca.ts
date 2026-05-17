import type { CamaraVoto } from "./types";

/**
 * Votos que indicam presença efetiva do deputado na sessão.
 * "Obstrução" é tática parlamentar — contabilizado como presente.
 * "Não votou" / "Art. 17" indicam ausência ou impedimento.
 */
const VOTOS_PRESENCA = new Set(["Sim", "Não", "Abstenção", "Obstrução"]);

/**
 * Calcula taxa de presença em votações plenárias (0–100).
 *
 * Usa os últimos votos registrados como proxy:
 * - Um deputado presente em ~150 sessões/ano gera ~150-200 registros
 * - Referência de 150 registros = presença ideal (100%)
 * - Abaixo disso, proporcional
 *
 * Limitação: não temos o total absoluto de sessões do plenário no período.
 * Isso é uma aproximação — pode ser melhorada quando integrarmos
 * o endpoint /votacoes global com contagem de sessões.
 */
export function calcPresenceRate(votacoes: CamaraVoto[]): number {
  if (votacoes.length === 0) return 0;

  const present = votacoes.filter((v) => VOTOS_PRESENCA.has(v.tipoVoto)).length;

  // 150 = baseline esperado para deputado assíduo em 6 meses
  const BASE_EXPECTED = 150;
  const rate = (present / BASE_EXPECTED) * 100;
  return Math.min(100, Math.round(rate));
}

export type { CamaraVoto };
