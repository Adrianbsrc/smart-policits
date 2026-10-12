import type { JobContext } from "../../contracts/job.contract";
import type { QualityIssue } from "../models/quality-issue.model";

export interface QualityRuleResult {
  ruleId: string;
  issues: QualityIssue[];
}

/**
 * Uma regra de qualidade — 100% genérica. Nenhuma regra pode conhecer
 * PoliticalProfile (ou qualquer outro domínio): o conhecimento de domínio
 * entra via configuração (FieldRef/predicados, ver field-ref.contract.ts)
 * passada no construtor de cada regra concreta, nunca no código da regra.
 */
export interface QualityRule<T> {
  readonly id: string;
  evaluate(value: T, context: JobContext): QualityRuleResult | Promise<QualityRuleResult>;
}
