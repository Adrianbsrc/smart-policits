/**
 * Construtores de RawScoreInput para deputados e senadores.
 *
 * ─── METODOLOGIA ─────────────────────────────────────────────────────────────
 *
 * Cada campo de input é preenchido com dados reais de APIs públicas ou com
 * um valor NEUTRO quando dados são insuficientes.
 *
 * VALORES NEUTROS ≠ ZERO:
 * Zero penalizaria artificialmente quem não tem dados disponíveis.
 * Neutro (5.0 em escala 0–10, 50 em escala 0–100) = "sem informação suficiente".
 *
 * Score temático (parliamentary):
 * Baseado em TAXA DE PARTICIPAÇÃO em votações classificadas por tema.
 * NÃO avalia o sentido do voto (Sim vs Não) — isso requeriria julgamento
 * ideológico e não é possível de forma imparcial.
 * Fonte: Câmara dos Deputados / Senado Federal (APIs públicas).
 *
 * Integridade (CNJ):
 * Dados de processos judiciais do CNJ Datajud (API pública).
 * Apenas processos onde o político é réu/investigado — não como autor.
 * Falsos positivos são filtrados pelo CNJ client.
 */

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
import {
  calcThematicActivityScores,
} from "@smart-politics/scoring";
import type { CamaraVoto } from "../sources/camara/types";
import { calcPresenceRate } from "../sources/camara/presenca";
import type { ProposicoesResult } from "../sources/camara/proposicoes";
import type { CamaraOrgao } from "../sources/camara/orgaos";
import { calcCommitteeParticipation } from "../sources/camara/orgaos";
import type { SenadoVoto } from "../sources/senado/votacoes";
import { calcSenadorPresenceRate } from "../sources/senado/votacoes";
import type { MateriasResult } from "../sources/senado/materias";
import type { CnjPoliticianProfile } from "../sources/cnj/cnj.types";

// ─── Valores neutros ───────────────────────────────────────────────────────────

export const NEUTRAL_INTEGRITY: IntegrityInput = {
  criminalConvictions:           0,
  criminalCharges:               0,
  tcuConvictions:                0,
  tcuPendingInvestigations:      0,
  ethicsViolations:              0,
  mandateCancelledPrevious:      false,
  fichaLimpaIneligible:          false,
  mpChargesAccepted:             0,
  patrimonyInconsistencyPercent: 0,
  provenFalseDeclarations:       0,
};

export const NEUTRAL_FISCAL: FiscalInput = {
  budgetBalanceScore:     5,
  publicDebtDelta:        0,
  tcuAuditScore:          5,
  expenseEfficiencyScore: 5,
};

export const NEUTRAL_CONSTITUTIONAL: ConstitutionalInput = {
  fundamentalRightsScore:      5,
  powerSeparationScore:        5,
  legalityScore:               5,
  institutionalCoherenceScore: 5,
};

/** Valor neutro para dimensões temáticas (dado insuficiente — sem prêmio nem penalidade). */
export const NEUTRAL_THEMATIC: ThematicInput = {
  education:        50,
  health:           50,
  security:         50,
  economy:          50,
  environment:      50,
  infrastructure:   50,
  technology:       50,
  agriculture:      50,
  international:    50,
  culture:          50,
  socialRights:     50,
  entrepreneurship: 50,
};

// ─── CNJ → IntegrityInput ─────────────────────────────────────────────────────

/**
 * Converte perfil CNJ Datajud em campos de IntegrityInput.
 *
 * NOTA: busca por nome tem falsos positivos inevitáveis (homônimos).
 * O CNJ client já filtra por tipo de parte (réu/investigado) para reduzir isso.
 * Mesmo assim, aplica caps conservadores para não penalizar injustamente.
 *
 * Fonte: CNJ Datajud — API pública (api-publica.datajud.cnj.jus.br).
 */
export function buildIntegrityFromCnjProfile(
  profile: CnjPoliticianProfile,
): Pick<IntegrityInput, 'criminalConvictions' | 'criminalCharges' | 'mpChargesAccepted'> {
  return {
    // Encerrados com movimentos de condenação — cap 3 para evitar distorção por falsos positivos
    criminalConvictions: Math.min(profile.criminaisEncerrados, 3),
    // Processos criminais ativos (não arquivados) — cap 5
    criminalCharges:     Math.min(profile.criminaisAtivos, 5),
    // Aproximação: processos que chegaram ao STF/STJ já passaram pelo MP — cap 3
    mpChargesAccepted:   Math.min(profile.criminaisAtivos, 3),
  };
}

// ─── Deputado Federal ──────────────────────────────────────────────────────────

export interface DeputadoRealData {
  votacoes:        CamaraVoto[];
  proposicoes:     ProposicoesResult;
  publicouDespesas: boolean;
  orgaos:          CamaraOrgao[];
  /** Perfil CNJ opcional — integrado se disponível, ignorado se falhar. */
  cnjProfile?:     CnjPoliticianProfile | null;
}

function buildDeputadoLegislativeInput(data: DeputadoRealData): LegislativeInput {
  return {
    presenceRate:             calcPresenceRate(data.votacoes),
    billsProposed:            data.proposicoes.proposed,
    billsApproved:            data.proposicoes.approved,
    committeeParticipation:   calcCommitteeParticipation(data.orgaos),
    discourseVoteConsistency: 50, // dado insuficiente sem cruzamento de declarações
  };
}

function buildDeputadoTransparencyInput(data: DeputadoRealData): TransparencyInput {
  return {
    // CGU: nota de transparência — sem acesso por API para parlamentares individuais → neutro
    cguTransparencyScore:  5,
    // TSE: bens declarados — considerado true se chegou ao mandato
    patrimonyDeclared:     true,
    // CEAP: publicação de despesas da cota parlamentar (API Câmara)
    spendingPublishedRate: data.publicouDespesas ? 90 : 30,
    // Audiências públicas: dado não disponível via API → neutro
    publicMeetingsRate:    50,
    // Portal de dados abertos Câmara: compliance geral → neutro (sem API individual)
    openDataCompliance:    5,
  };
}

/**
 * Score temático baseado em participação em votações classificadas por tema.
 *
 * IMPARCIAL: mede ATIVIDADE (presença/ausência) por área, não o sentido do voto.
 * Critério: parlamentar presente (voto ≠ ausência/abstenção) em votações do tema.
 * Dado insuficiente (< 3 votações no tema) → 50 (neutro).
 *
 * Fonte: Câmara dos Deputados API — /deputados/{id}/votacoes
 */
function buildThematicFromCamaraVotes(votacoes: CamaraVoto[]): ThematicInput {
  if (votacoes.length === 0) return NEUTRAL_THEMATIC;

  const classifiedVotes = votacoes.map((v) => ({
    tipoVoto: v.tipoVoto,
    descricao: v.descricao,
  }));

  const scores = calcThematicActivityScores(classifiedVotes);
  return scores as ThematicInput;
}

/**
 * Monta RawScoreInput para deputado federal com dados reais da Câmara API.
 *
 * Dados reais:      presença, projetos, despesas CEAP, comissões, temático por votações.
 * CNJ (opcional):   criminalCharges, criminalConvictions — se cnjProfile disponível.
 * Dados neutros:    fiscal, constitucional (dados não disponíveis por API para deputados).
 */
export function buildDeputadoScoreInput(
  role: PoliticalRole,
  data: DeputadoRealData,
): RawScoreInput {
  // Integridade: base neutra + CNJ se disponível
  const integrity: IntegrityInput = { ...NEUTRAL_INTEGRITY };
  if (data.cnjProfile) {
    const cnjFields = buildIntegrityFromCnjProfile(data.cnjProfile);
    integrity.criminalConvictions = cnjFields.criminalConvictions;
    integrity.criminalCharges     = cnjFields.criminalCharges;
    integrity.mpChargesAccepted   = cnjFields.mpChargesAccepted;
  }

  return {
    role,
    integrity,
    transparency: buildDeputadoTransparencyInput(data),
    legislative:  buildDeputadoLegislativeInput(data),
    fiscal:       NEUTRAL_FISCAL,
    constitutional: NEUTRAL_CONSTITUTIONAL,
    thematic:     buildThematicFromCamaraVotes(data.votacoes),
  };
}

// ─── Senador Federal ───────────────────────────────────────────────────────────

export interface SenadorRealData {
  votacoes:    SenadoVoto[];
  materias:    MateriasResult;
  /** Perfil CNJ opcional — integrado se disponível, ignorado se falhar. */
  cnjProfile?: CnjPoliticianProfile | null;
}

function buildSenadorLegislativeInput(data: SenadorRealData): LegislativeInput {
  return {
    presenceRate:             calcSenadorPresenceRate(data.votacoes),
    billsProposed:            data.materias.proposed,
    billsApproved:            data.materias.approved,
    committeeParticipation:   50, // dado não disponível via API Senado → neutro
    discourseVoteConsistency: 50,
  };
}

/**
 * Score temático para senadores: presença em votações classificadas por tema.
 * Usa o mesmo critério de imparcialidade dos deputados.
 *
 * Fonte: Senado Federal API — /senador/{id}/votacoes
 */
function buildThematicFromSenadoVotes(votacoes: SenadoVoto[]): ThematicInput {
  if (votacoes.length === 0) return NEUTRAL_THEMATIC;

  // SenadoVoto.VotoParlamentar = "Sim" | "Não" | "Abstenção" | "P-OD" | "Obstrução"
  // SenadoVoto.DescricaoVotacao = texto da votação
  const classifiedVotes = votacoes.map((v) => ({
    tipoVoto: v.VotoParlamentar,
    descricao: v.DescricaoVotacao,
  }));

  const scores = calcThematicActivityScores(classifiedVotes);
  return scores as ThematicInput;
}

/**
 * Monta RawScoreInput para senador com dados reais do Senado API.
 *
 * Dados reais:      presença em votações, matérias apresentadas/aprovadas, temático.
 * CNJ (opcional):   integrado se cnjProfile disponível.
 * Dados neutros:    transparência, fiscal, constitucional.
 */
export function buildSenadorScoreInput(data: SenadorRealData): RawScoreInput {
  const integrity: IntegrityInput = { ...NEUTRAL_INTEGRITY };
  if (data.cnjProfile) {
    const cnjFields = buildIntegrityFromCnjProfile(data.cnjProfile);
    integrity.criminalConvictions = cnjFields.criminalConvictions;
    integrity.criminalCharges     = cnjFields.criminalCharges;
    integrity.mpChargesAccepted   = cnjFields.mpChargesAccepted;
  }

  return {
    role: 'senator',
    integrity,
    transparency: {
      cguTransparencyScore:  5,
      patrimonyDeclared:     true,
      spendingPublishedRate: 50,  // CEAP do Senado: dado não disponível via API individual
      publicMeetingsRate:    50,
      openDataCompliance:    5,
    },
    legislative:    buildSenadorLegislativeInput(data),
    fiscal:         NEUTRAL_FISCAL,
    constitutional: NEUTRAL_CONSTITUTIONAL,
    thematic:       buildThematicFromSenadoVotes(data.votacoes),
  };
}
