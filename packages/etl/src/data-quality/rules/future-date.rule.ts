import type { JobContext } from "../../contracts/job.contract";
import type { FieldRef } from "../contracts/field-ref.contract";
import type { QualityRule, QualityRuleResult } from "../contracts/quality-rule.contract";
import type { QualityIssue } from "../models/quality-issue.model";

/** Checa se campos de data configurados não estão no futuro (dado implausível/mal coletado). */
export class FutureDateRule<T> implements QualityRule<T> {
  readonly id = "future-date";

  constructor(
    private readonly fields: FieldRef<T, Date | null | undefined>[],
    /** Injetável para testes — por padrão usa o relógio real. */
    private readonly now: () => Date = () => new Date(),
  ) {}

  evaluate(value: T, _context: JobContext): QualityRuleResult {
    const issues: QualityIssue[] = [];
    const reference = this.now();

    for (const field of this.fields) {
      const date = field.get(value);
      if (date && date.getTime() > reference.getTime()) {
        issues.push({
          code: "future-date",
          field: field.label,
          message: `Campo "${field.label}" tem data no futuro (${date.toISOString()}).`,
          severity: "error",
        });
      }
    }

    return { ruleId: this.id, issues };
  }
}
