import type { JobContext } from "../../contracts/job.contract";
import type { QualityRule, QualityRuleResult } from "../contracts/quality-rule.contract";
import type { QualityIssue } from "../models/quality-issue.model";

export interface ValueConstraint<T, TValue = unknown> {
  label: string;
  get(value: T): TValue;
  isValid(value: TValue): boolean;
  message: string;
}

/**
 * Roda um predicado configurável contra um campo — a forma mais genérica de
 * expressar "este valor deve satisfazer tal regra de negócio" sem que a
 * regra em si conheça o domínio (o predicado e a mensagem vêm de fora).
 */
export class InvalidValueRule<T> implements QualityRule<T> {
  readonly id = "invalid-value";

  constructor(private readonly constraints: ValueConstraint<T>[]) {}

  evaluate(value: T, _context: JobContext): QualityRuleResult {
    const issues: QualityIssue[] = [];

    for (const constraint of this.constraints) {
      if (!constraint.isValid(constraint.get(value))) {
        issues.push({
          code: "invalid-value",
          field: constraint.label,
          message: constraint.message,
          severity: "error",
        });
      }
    }

    return { ruleId: this.id, issues };
  }
}
