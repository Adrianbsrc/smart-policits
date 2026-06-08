"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_THEMES = exports.themesToThematicInput = exports.calcThematicActivityScores = exports.classifyTextToThemes = exports.SCORE_VERSION = void 0;
exports.calculateScore = calculateScore;
exports.calculateScoreFromMock = calculateScoreFromMock;
exports.SCORE_VERSION = '2.0.0';
// ─── Internal helpers ─────────────────────────────────────────────────────────
const EXECUTIVE_ROLES = new Set(['president', 'governor']);
function clamp(value, min = 0, max = 10) {
    return Math.min(max, Math.max(min, value));
}
function norm(value, max) {
    return clamp((value / max) * 10);
}
function r1(v) {
    return Math.round(v * 10) / 10;
}
function r2(v) {
    return Math.round(v * 100) / 100;
}
// ─── Integrity multiplier ─────────────────────────────────────────────────────
/**
 * Calcula o multiplicador de integridade (0.3–1.0).
 *
 * Começa em 1.0 e é reduzido por penalidades acumuladas.
 * O mínimo é 0.3 — nenhum dado de integridade pode, sozinho, zerar o score,
 * pois o sistema avalia condutas públicas, não emite condenações.
 *
 * Penalidades são cumulativas mas cada tipo tem um teto (maxCap),
 * evitando distorção por múltiplos registros do mesmo tipo.
 */
function calcIntegrityMultiplier(input) {
    const penalties = [];
    let total = 0;
    const add = (count, penaltyPer, reason, source, maxCap = 0.60) => {
        const n = typeof count === 'boolean' ? (count ? 1 : 0) : count;
        if (n <= 0)
            return;
        const p = r2(Math.min(penaltyPer * n, maxCap));
        total += p;
        penalties.push({ reason, penalty: p, source });
    };
    // Penalidades por gravidade decrescente
    add(input.criminalConvictions, 0.50, 'Condenação criminal transitada em julgado', 'STF / STJ / TJ estaduais');
    add(input.fichaLimpaIneligible, 0.40, 'Inelegível pela Lei da Ficha Limpa (LC 135/2010)', 'TSE');
    add(input.mandateCancelledPrevious, 0.35, 'Cassação de mandato em legislatura anterior', 'TSE / Câmara / Senado');
    add(input.tcuConvictions, 0.30, 'Condenação por irregularidade grave (TCU)', 'TCU', 0.50);
    add(input.criminalCharges, 0.20, 'Réu em processo criminal ativo', 'STF / STJ / TJ estaduais', 0.40);
    add(input.ethicsViolations, 0.20, 'Sanção do Conselho de Ética', 'Câmara dos Deputados / Senado Federal', 0.40);
    add(input.tcuPendingInvestigations, 0.10, 'Investigação TCU em andamento', 'TCU', 0.20);
    add(input.mpChargesAccepted, 0.10, 'Denúncia aceita pelo Ministério Público', 'Ministério Público Federal / Estadual', 0.20);
    add(input.provenFalseDeclarations, 0.10, 'Declaração falsa comprovada por fact-checking', 'Agências independentes (Aos Fatos, Lupa, etc.)', 0.20);
    if (input.patrimonyInconsistencyPercent > 50) {
        add(true, 0.15, `Inconsistência patrimonial grave (${input.patrimonyInconsistencyPercent.toFixed(0)}% acima da renda declarada)`, 'TSE / Receita Federal');
    }
    else if (input.patrimonyInconsistencyPercent > 20) {
        add(true, 0.07, `Inconsistência patrimonial moderada (${input.patrimonyInconsistencyPercent.toFixed(0)}% acima da renda declarada)`, 'TSE / Receita Federal');
    }
    const multiplier = r2(clamp(1.0 - total, 0.3, 1.0));
    return { multiplier, penalties };
}
// ─── Pilar: Transparência ─────────────────────────────────────────────────────
function calcTransparency(input) {
    return clamp(input.cguTransparencyScore * 0.40 +
        (input.patrimonyDeclared ? 10 : 0) * 0.20 +
        norm(input.spendingPublishedRate, 100) * 0.20 +
        norm(input.publicMeetingsRate, 100) * 0.10 +
        input.openDataCompliance * 0.10);
}
// ─── Pilar: Atuação Legislativa ───────────────────────────────────────────────
function calcLegislativeActivity(input) {
    // Taxa de aprovação premia qualidade sobre quantidade
    const approvalRatio = input.billsProposed > 0
        ? Math.min(input.billsApproved / input.billsProposed, 1)
        : 0;
    return clamp(norm(input.presenceRate, 100) * 0.30 +
        clamp(approvalRatio * 10) * 0.25 +
        norm(Math.min(input.billsApproved, 30), 30) * 0.20 +
        norm(input.committeeParticipation, 100) * 0.15 +
        norm(input.discourseVoteConsistency, 100) * 0.10);
}
// ─── Pilar: Eficiência Executiva ──────────────────────────────────────────────
function calcExecutiveEfficiency(input) {
    // socialIndicatorDelta: -100..+100 → 0..10
    const socialScore = clamp((input.socialIndicatorDelta + 100) / 20);
    return clamp(norm(input.budgetExecutionRate, 100) * 0.25 +
        norm(input.promisesKeptRate, 100) * 0.30 +
        socialScore * 0.30 +
        input.administrativeEfficiency * 0.15);
}
// ─── Pilar: Responsabilidade Fiscal ──────────────────────────────────────────
function calcFiscalResponsibility(input) {
    // publicDebtDelta: -100..+100 → invertido → menor dívida = nota mais alta
    const debtScore = clamp((-input.publicDebtDelta + 100) / 20);
    return clamp(input.budgetBalanceScore * 0.30 +
        debtScore * 0.25 +
        input.tcuAuditScore * 0.30 +
        input.expenseEfficiencyScore * 0.15);
}
// ─── Pilar: Alinhamento Constitucional ───────────────────────────────────────
function calcConstitutionalAlignment(input) {
    return clamp(input.fundamentalRightsScore * 0.40 +
        input.powerSeparationScore * 0.30 +
        input.legalityScore * 0.20 +
        input.institutionalCoherenceScore * 0.10);
}
// ─── Pilar: Impacto Temático ──────────────────────────────────────────────────
function calcThematic(input) {
    const t = (v) => norm(v, 100);
    return {
        education: t(input.education),
        health: t(input.health),
        security: t(input.security),
        economy: t(input.economy),
        environment: t(input.environment),
        infrastructure: t(input.infrastructure),
        technology: t(input.technology),
        agriculture: t(input.agriculture),
        international: t(input.international),
        culture: t(input.culture),
        socialRights: t(input.socialRights),
        entrepreneurship: t(input.entrepreneurship),
    };
}
// ─── Defaults para dados ausentes ────────────────────────────────────────────
function defaultLegislative() {
    return {
        presenceRate: 0,
        billsProposed: 0,
        billsApproved: 0,
        committeeParticipation: 0,
        discourseVoteConsistency: 50,
    };
}
function defaultExecutive() {
    return {
        budgetExecutionRate: 0,
        promisesKeptRate: 0,
        socialIndicatorDelta: 0,
        administrativeEfficiency: 0,
    };
}
// ─── Engine principal ─────────────────────────────────────────────────────────
function calculateScore(input) {
    const { multiplier, penalties } = calcIntegrityMultiplier(input.integrity);
    const transparency = calcTransparency(input.transparency);
    const isExecutive = EXECUTIVE_ROLES.has(input.role);
    const activity = isExecutive
        ? calcExecutiveEfficiency(input.executive ?? defaultExecutive())
        : calcLegislativeActivity(input.legislative ?? defaultLegislative());
    const fiscal = calcFiscalResponsibility(input.fiscal);
    const constitutional = calcConstitutionalAlignment(input.constitutional);
    const thematic = calcThematic(input.thematic);
    const thematicValues = Object.values(thematic);
    const thematicAvg = thematicValues.reduce((a, b) => a + b, 0) / thematicValues.length;
    // Base score: transparência 20%, atuação 20%, fiscal 15%, constitucional 15%, temático 30%
    const baseScore = clamp(transparency * 0.20 +
        activity * 0.20 +
        fiscal * 0.15 +
        constitutional * 0.15 +
        thematicAvg * 0.30);
    const overall = r1(clamp(baseScore * multiplier));
    return {
        overall,
        education: r1(thematic.education),
        health: r1(thematic.health),
        security: r1(thematic.security),
        economy: r1(thematic.economy),
        environment: r1(thematic.environment),
        infrastructure: r1(thematic.infrastructure),
        technology: r1(thematic.technology),
        agriculture: r1(thematic.agriculture),
        international: r1(thematic.international),
        culture: r1(thematic.culture),
        socialRights: r1(thematic.socialRights),
        entrepreneurship: r1(thematic.entrepreneurship),
        transparency: r1(transparency),
        constitutional: r1(constitutional),
        fiscal: r1(fiscal),
        activity: r1(activity),
        integrityMultiplier: multiplier,
        breakdown: {
            baseScore: r1(baseScore),
            integrityMultiplier: multiplier,
            transparency: r1(transparency),
            activity: r1(activity),
            fiscal: r1(fiscal),
            constitutional: r1(constitutional),
            thematic: r1(thematicAvg),
        },
        penalties,
        scoreVersion: exports.SCORE_VERSION,
    };
}
// ─── Classificador temático (re-exportado para uso no ETL) ───────────────────
var thematic_classifier_1 = require("./thematic-classifier");
Object.defineProperty(exports, "classifyTextToThemes", { enumerable: true, get: function () { return thematic_classifier_1.classifyTextToThemes; } });
Object.defineProperty(exports, "calcThematicActivityScores", { enumerable: true, get: function () { return thematic_classifier_1.calcThematicActivityScores; } });
Object.defineProperty(exports, "themesToThematicInput", { enumerable: true, get: function () { return thematic_classifier_1.themesToThematicInput; } });
Object.defineProperty(exports, "ALL_THEMES", { enumerable: true, get: function () { return thematic_classifier_1.ALL_THEMES; } });
// ─── Mock determinístico (dev/seed) ──────────────────────────────────────────
/**
 * Gera um ScoreResult determinístico baseado em seed numérico.
 * Usada pelo ETL enquanto dados reais não estão disponíveis.
 * A distribuição simula a realidade: maioria "média", poucos com issues de integridade.
 */
function calculateScoreFromMock(seed, role = 'federal_deputy') {
    // LCG-like seeded random: estável entre execuções
    const rng = (offset, min = 0, max = 1) => {
        const x = Math.sin(seed * 9301 + offset * 49297 + 233995) * 10_000;
        return (x - Math.floor(x)) * (max - min) + min;
    };
    const pct = (o, min = 20, max = 100) => rng(o, min, max);
    const score = (o, min = 3, max = 10) => rng(o, min, max);
    const count = (o, prob) => rng(o) < prob ? 1 : 0;
    const isExecutive = EXECUTIVE_ROLES.has(role);
    const input = {
        role,
        integrity: {
            criminalConvictions: count(1, 0.05),
            criminalCharges: count(2, 0.12),
            tcuConvictions: count(3, 0.08),
            tcuPendingInvestigations: count(4, 0.18),
            ethicsViolations: count(5, 0.10),
            mandateCancelledPrevious: rng(6) < 0.02,
            fichaLimpaIneligible: rng(7) < 0.03,
            mpChargesAccepted: count(8, 0.12),
            patrimonyInconsistencyPercent: rng(9, 0, 70),
            provenFalseDeclarations: count(10, 0.08),
        },
        transparency: {
            cguTransparencyScore: score(11, 4, 10),
            patrimonyDeclared: rng(12) > 0.05,
            spendingPublishedRate: pct(13, 50, 100),
            publicMeetingsRate: pct(14, 30, 100),
            openDataCompliance: score(15, 3, 10),
        },
        legislative: {
            presenceRate: pct(16, 55, 100),
            billsProposed: Math.floor(rng(17, 2, 40)),
            billsApproved: Math.floor(rng(18, 0, 12)),
            committeeParticipation: pct(19, 30, 100),
            discourseVoteConsistency: pct(20, 40, 100),
        },
        executive: {
            budgetExecutionRate: isExecutive ? pct(21, 60, 100) : 0,
            promisesKeptRate: isExecutive ? pct(22, 20, 80) : 0,
            socialIndicatorDelta: isExecutive ? rng(23, -30, 40) : 0,
            administrativeEfficiency: isExecutive ? score(24, 3, 9) : 0,
        },
        fiscal: {
            budgetBalanceScore: score(25, 2, 10),
            publicDebtDelta: rng(26, -20, 40),
            tcuAuditScore: score(27, 3, 10),
            expenseEfficiencyScore: score(28, 3, 10),
        },
        constitutional: {
            fundamentalRightsScore: score(29, 3, 10),
            powerSeparationScore: score(30, 4, 10),
            legalityScore: score(31, 4, 10),
            institutionalCoherenceScore: score(32, 3, 10),
        },
        thematic: {
            education: pct(33, 20, 100),
            health: pct(34, 20, 100),
            security: pct(35, 20, 100),
            economy: pct(36, 20, 100),
            environment: pct(37, 10, 100),
            infrastructure: pct(38, 10, 100),
            technology: pct(39, 10, 100),
            agriculture: pct(40, 10, 100),
            international: pct(41, 10, 100),
            culture: pct(42, 10, 100),
            socialRights: pct(43, 20, 100),
            entrepreneurship: pct(44, 10, 100),
        },
    };
    return calculateScore(input);
}
//# sourceMappingURL=index.js.map