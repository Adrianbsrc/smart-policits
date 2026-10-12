import type { QualityRuleResult } from "../contracts/quality-rule.contract";
import type { QualityReport } from "./quality-report.model";

const SCORE_START = 100;
const ERROR_PENALTY = 25;
const WARNING_PENALTY = 8;

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Agrega os QualityRuleResult de todas as regras executadas em um único
 * QualityReport. A fórmula de score é um heurístico simples e substituível
 * — nenhuma regra depende dela; só este factory a conhece, então trocar a
 * fórmula nunca exige tocar em uma regra.
 */
export const QualityReportFactory = {
  build(results: QualityRuleResult[]): QualityReport {
    const issues = results.flatMap((result) => result.issues);
    const errors = issues.filter((issue) => issue.severity === "error");
    const warnings = issues.filter((issue) => issue.severity === "warning");
    const recommendations = issues.filter((issue) => issue.severity === "recommendation");

    const score = clampScore(SCORE_START - errors.length * ERROR_PENALTY - warnings.length * WARNING_PENALTY);

    return {
      score,
      errors,
      warnings,
      recommendations,
      approved: errors.length === 0,
    };
  },
};
