/**
 * `error` bloqueia (`QualityReport.approved` vira false); `warning` e
 * `recommendation` nunca bloqueiam, só informam.
 */
export type QualitySeverity = "error" | "warning" | "recommendation";

export interface QualityIssue {
  code: string;
  message: string;
  severity: QualitySeverity;
  field?: string;
}
