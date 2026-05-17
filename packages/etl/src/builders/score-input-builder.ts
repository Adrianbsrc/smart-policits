import type {
  RawScoreInput,
  PoliticalRole,
  IntegrityInput,
  TransparencyInput,
  LegislativeInput,
  FiscalInput,
  ConstitutionalInput,
  ThematicInput,
} from "@smart-politics/scoring";
import type { CamaraVoto } from "../sources/camara/types";
import { calcPresenceRate } from "../sources/camara/presenca";
import type { ProposicoesResult } from "../sources/camara/proposicoes";

// ─── Valores neutros ─────────────────────────────────────────────────────────
// Usados quando dados reais ainda não estão disponíveis.
// Neutro ≠ zero: queremos evitar penalizar artificialmente por falta de dados.
// 5.0 em escala 0–10 = linha média sem prêmio e sem punição.

export const NEUTRAL_INTEGRITY: IntegrityInput = {
  criminalConvictions: 0,
  criminalCharges: 0,
  tcuConvictions: 0,
  tcuPendingInvestigations: 0,
  ethicsViolations: 0,
  mandateCancelledPrevious: false,
  fichaLimpaIneligible: false,
  mpChargesAccepted: 0,
  patrimonyInconsistencyPercent: 0,
  provenFalseDeclarations: 0,
};

export const NEUTRAL_FISCAL: FiscalInput = {
  budgetBalanceScore: 5,
  publicDebtDelta: 0,
  tcuAuditScore: 5,
  expenseEfficiencyScore: 5,
};

export const NEUTRAL_CONSTITUTIONAL: ConstitutionalInput = {
  fundamentalRightsScore: 5,
  powerSeparationScore: 5,
  legalityScore: 5,
  institutionalCoherenceScore: 5,
};

export const NEUTRAL_THEMATIC: ThematicInput = {
  education: 50,
  health: 50,
  security: 50,
  economy: 50,
  environment: 50,
  infrastructure: 50,
  technology: 50,
  agriculture: 50,
  international: 50,
  culture: 50,
  socialRights: 50,
  entrepreneurship: 50,
};

// ─── Dados reais para legislativo ────────────────────────────────────────────

export interface DeputadoRealData {
  votacoes: CamaraVoto[];
  proposicoes: ProposicoesResult;
  publicouDespesas: boolean;
}

/**
 * Constrói LegislativeInput a partir de dados reais da Câmara API.
 */
function buildLegislativeInput(data: DeputadoRealData): LegislativeInput {
  return {
    presenceRate: calcPresenceRate(data.votacoes),
    billsProposed: data.proposicoes.proposed,
    billsApproved: data.proposicoes.approved,
    committeeParticipation: 50, // aguardando endpoint /eventos com presença por comissão
    discourseVoteConsistency: 50, // aguardando análise de discursos vs votações
  };
}

/**
 * Constrói TransparencyInput parcialmente real.
 * - spendingPublishedRate: derivado de dados CEAP reais
 * - Demais campos: neutros até integração CGU/TSE
 */
function buildTransparencyInput(data: DeputadoRealData): TransparencyInput {
  return {
    cguTransparencyScore: 5,
    patrimonyDeclared: true, // deputados federais são obrigados por lei
    spendingPublishedRate: data.publicouDespesas ? 90 : 30,
    publicMeetingsRate: 50,
    openDataCompliance: 5,
  };
}

// ─── Builder principal ────────────────────────────────────────────────────────

/**
 * Monta RawScoreInput para um deputado federal com dados reais da Câmara API.
 *
 * Pilares com dados reais:
 * - Transparência (parcial): spendingPublishedRate via CEAP
 * - Atuação Legislativa: presença, projetos propostos/aprovados
 *
 * Pilares com valores neutros (dados reais chegam em sprints futuros):
 * - Integridade: multiplier = 1.0 (sem penalidades artificiais)
 * - Fiscal: 5.0 (linha média)
 * - Constitucional: 5.0 (linha média)
 * - Temático: 50 por dimensão (linha média)
 */
export function buildDeputadoScoreInput(
  role: PoliticalRole,
  data: DeputadoRealData,
): RawScoreInput {
  return {
    role,
    integrity: NEUTRAL_INTEGRITY,
    transparency: buildTransparencyInput(data),
    legislative: buildLegislativeInput(data),
    fiscal: NEUTRAL_FISCAL,
    constitutional: NEUTRAL_CONSTITUTIONAL,
    thematic: NEUTRAL_THEMATIC,
  };
}
