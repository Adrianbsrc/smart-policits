import type { JobContext } from "../../contracts/job.contract";
import type { FieldRef } from "../contracts/field-ref.contract";
import type { QualityRule, QualityRuleResult } from "../contracts/quality-rule.contract";
import type { QualityIssue } from "../models/quality-issue.model";

/**
 * Diferente de RequiredFieldsRule: aqui o campo existe (não é null/undefined),
 * mas o texto é só espaço em branco — um problema de qualidade do conteúdo,
 * não de ausência do campo.
 */
export class EmptyTextRule<T> implements QualityRule<T> {
  readonly id = "empty-text";

  constructor(private readonly fields: FieldRef<T, string | null | undefined>[]) {}

  evaluate(value: T, _context: JobContext): QualityRuleResult {
    const issues: QualityIssue[] = [];

    for (const field of this.fields) {
      const text = field.get(value);
      if (text !== null && text !== undefined && text.trim().length === 0) {
        issues.push({
          code: "empty-text",
          field: field.label,
          message: `Campo "${field.label}" está preenchido apenas com espaços em branco.`,
          severity: "warning",
        });
      }
    }

    return { ruleId: this.id, issues };
  }
}
