/**
 * Smart Politics — Political Scoring Engine v2.0
 *
 * Score final = base_score × integrity_multiplier
 *
 * Pilares do base_score (pesos):
 *   Transparência          20%
 *   Atuação (leg/exec)     20%
 *   Responsabilidade Fiscal 15%
 *   Alinhamento CF/88      15%
 *   Impacto Temático       30%
 *
 * O integrity_multiplier (0.3–1.0) penaliza condutas antiéticas
 * comprovadas por fontes oficiais, reduzindo o score geral
 * independentemente da atuação em outras dimensões.
 */
export declare const SCORE_VERSION = "2.0.0";
export type PoliticalRole = 'president' | 'governor' | 'senator' | 'federal_deputy' | 'state_deputy';
/**
 * Integridade: penalizadores baseados em registros públicos oficiais.
 * Cada violação reduz o integrity_multiplier, que é aplicado ao score base.
 * Fonte: STF, STJ, TSE, TCU, CGU, Conselho de Ética, Ministério Público.
 */
export interface IntegrityInput {
    /** Condenações criminais transitadas em julgado (STF/STJ/TJ estaduais) */
    criminalConvictions: number;
    /** Réu em processo criminal ativo (não arquivado) */
    criminalCharges: number;
    /** Condenações por irregularidade grave pelo TCU */
    tcuConvictions: number;
    /** Investigações TCU em andamento (não concluídas) */
    tcuPendingInvestigations: number;
    /** Sanções do Conselho de Ética da Câmara ou Senado */
    ethicsViolations: number;
    /** Cassação de mandato em legislatura anterior */
    mandateCancelledPrevious: boolean;
    /** Inelegível pela Lei da Ficha Limpa (LC 135/2010) */
    fichaLimpaIneligible: boolean;
    /** Denúncias aceitas pelo MP (não arquivadas pelo judiciário) */
    mpChargesAccepted: number;
    /** Crescimento patrimonial incompatível com renda declarada ao TSE (0–100%) */
    patrimonyInconsistencyPercent: number;
    /** Declarações falsas comprovadas por agências independentes de fact-checking */
    provenFalseDeclarations: number;
}
/**
 * Transparência: publicidade e acesso às informações dos atos públicos.
 * Fonte: CGU, TSE, Portal da Câmara/Senado, portais de dados abertos.
 */
export interface TransparencyInput {
    /** Nota de transparência da CGU (0–10) */
    cguTransparencyScore: number;
    /** Declaração de bens entregue e publicada no TSE */
    patrimonyDeclared: boolean;
    /** % de gastos públicos publicados no portal oficial (CEAP, diário) (0–100) */
    spendingPublishedRate: number;
    /** % de presença em audiências públicas convocadas (0–100) */
    publicMeetingsRate: number;
    /** Compliance com portais de dados abertos (e-SIC, API pública) (0–10) */
    openDataCompliance: number;
}
/**
 * Atuação Legislativa: produção e presença no mandato parlamentar.
 * Aplicável a: senador, federal_deputy, state_deputy.
 * Fonte: Câmara dos Deputados, Senado Federal (APIs abertas).
 */
export interface LegislativeInput {
    /** % de presença em votações plenárias registradas (0–100) */
    presenceRate: number;
    /** Total de projetos de lei / propostas apresentadas */
    billsProposed: number;
    /** Projetos aprovados em qualquer fase (plenário ou comissão) */
    billsApproved: number;
    /** % de participação ativa em reuniões de comissões (0–100) */
    committeeParticipation: number;
    /** Coerência entre declarações públicas e voto registrado (0–100) */
    discourseVoteConsistency: number;
}
/**
 * Eficiência Executiva: gestão do mandato e entrega de resultados.
 * Aplicável a: president, governor.
 * Fonte: portais de transparência, índices IBGE/IPEA, fact-checkers.
 */
export interface ExecutiveInput {
    /** % de execução do orçamento aprovado (0–100) */
    budgetExecutionRate: number;
    /** % de promessas de campanha cumpridas ou em execução documentada (0–100) */
    promisesKeptRate: number;
    /** Variação relativa de indicadores sociais no mandato (-100 = piora / +100 = melhora) */
    socialIndicatorDelta: number;
    /** Índice de eficiência administrativa (0–10) */
    administrativeEfficiency: number;
}
/**
 * Responsabilidade Fiscal: gestão das finanças públicas.
 * Fonte: TCU, STN (Siconfi), portais de transparência fiscal.
 */
export interface FiscalInput {
    /** Equilíbrio fiscal: 10 = superávit robusto / 0 = déficit grave (LRF) */
    budgetBalanceScore: number;
    /** Variação % da dívida pública durante o mandato (-100 = queda / +100 = crescimento) */
    publicDebtDelta: number;
    /** Resultado consolidado das auditorias TCU (0–10) */
    tcuAuditScore: number;
    /** Eficiência dos gastos: relação entre investimento e resultado entregue (0–10) */
    expenseEfficiencyScore: number;
}
/**
 * Alinhamento Constitucional: respeito à Constituição Federal de 1988.
 * Avalia condutas em relação a princípios fundamentais da ordem democrática.
 * Fonte: STF, análise de votações, relatórios de entidades constitucionais.
 */
export interface ConstitutionalInput {
    /** Defesa de direitos fundamentais (Art. 5–11 CF/88) (0–10) */
    fundamentalRightsScore: number;
    /** Respeito à separação e independência dos poderes (Art. 2 CF/88) (0–10) */
    powerSeparationScore: number;
    /** Observância do princípio da legalidade e moralidade (Art. 37 CF/88) (0–10) */
    legalityScore: number;
    /** Coerência institucional e respeito às normas democráticas (0–10) */
    institutionalCoherenceScore: number;
}
/**
 * Impacto Temático: atuação/votações por área de política pública.
 * Para legislativos: % de votos favoráveis a pautas progressivas na área (0–100).
 * Para executivos: % de metas atingidas na área (0–100).
 */
export interface ThematicInput {
    education: number;
    health: number;
    security: number;
    economy: number;
    environment: number;
    infrastructure: number;
    technology: number;
    agriculture: number;
    international: number;
    culture: number;
    socialRights: number;
    entrepreneurship: number;
}
export interface RawScoreInput {
    role: PoliticalRole;
    integrity: IntegrityInput;
    transparency: TransparencyInput;
    /** Obrigatório para senator, federal_deputy, state_deputy */
    legislative?: LegislativeInput;
    /** Obrigatório para president, governor */
    executive?: ExecutiveInput;
    fiscal: FiscalInput;
    constitutional: ConstitutionalInput;
    thematic: ThematicInput;
}
export interface PenaltyRecord {
    /** Descrição legível da violação para exibição ao usuário */
    reason: string;
    /** Penalidade aplicada ao multiplicador (ex: 0.20 = -20%) */
    penalty: number;
    /** Fonte oficial de onde o dado foi extraído */
    source: string;
}
export interface ScoreBreakdown {
    /** Score bruto antes da penalização de integridade (0–10) */
    baseScore: number;
    /** Multiplicador de integridade aplicado (0.3–1.0) */
    integrityMultiplier: number;
    /** Pilar: Transparência (peso 20% no base_score) */
    transparency: number;
    /** Pilar: Atuação legislativa ou eficiência executiva (peso 20%) */
    activity: number;
    /** Pilar: Responsabilidade Fiscal (peso 15%) */
    fiscal: number;
    /** Pilar: Alinhamento Constitucional (peso 15%) */
    constitutional: number;
    /** Pilar: Média das dimensões temáticas (peso 30%) */
    thematic: number;
}
export interface ScoreResult {
    /** Score final = base_score × integrity_multiplier, escala 0–10 */
    overall: number;
    education: number;
    health: number;
    security: number;
    economy: number;
    environment: number;
    infrastructure: number;
    technology: number;
    agriculture: number;
    international: number;
    culture: number;
    socialRights: number;
    entrepreneurship: number;
    transparency: number;
    constitutional: number;
    fiscal: number;
    /** Atuação legislativa (leg) ou eficiência executiva (exec) */
    activity: number;
    /** Multiplicador de integridade aplicado ao score base (0.3–1.0) */
    integrityMultiplier: number;
    breakdown: ScoreBreakdown;
    penalties: PenaltyRecord[];
    scoreVersion: string;
}
export declare function calculateScore(input: RawScoreInput): ScoreResult;
export { classifyTextToThemes, calcThematicActivityScores, themesToThematicInput, ALL_THEMES, } from './thematic-classifier';
export type { ThemeDimension, ClassifiedVote } from './thematic-classifier';
/**
 * Gera um ScoreResult determinístico baseado em seed numérico.
 * Usada pelo ETL enquanto dados reais não estão disponíveis.
 * A distribuição simula a realidade: maioria "média", poucos com issues de integridade.
 */
export declare function calculateScoreFromMock(seed: number, role?: PoliticalRole): ScoreResult;
//# sourceMappingURL=index.d.ts.map