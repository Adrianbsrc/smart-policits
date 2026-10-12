import type { QualityIssue } from "../models/quality-issue.model";

/**
 * Resultado consolidado do QualityEngine para um objeto normalizado.
 * `approved` é o único sinal que o Import Engine deve consultar: nenhum
 * dado com `approved: false` deve seguir para o Import Engine
 * (docs/SPECs/etl.md).
 */
export interface QualityReport {
  /** 0 a 100 — ver quality-report.factory.ts para a fórmula (heurística, substituível). */
  score: number;
  errors: QualityIssue[];
  warnings: QualityIssue[];
  recommendations: QualityIssue[];
  approved: boolean;
}
