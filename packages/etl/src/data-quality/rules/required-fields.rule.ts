import type { JobContext } from "../../contracts/job.contract";
import type { FieldRef } from "../contracts/field-ref.contract";
import type { QualityRule, QualityRuleResult } from "../contracts/quality-rule.contract";
import type { QualityIssue } from "../models/quality-issue.model";

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Verifica se os campos configurados estão presentes (não nulos, não vazios).
 * Genérica: recebe `FieldRef<T>[]` — nunca sabe o que é "fullName" nem o que
 * é um PoliticalProfile.
 */
export class RequiredFieldsRule<T> implements QualityRule<T> {
  readonly id = "required-fields";

  constructor(private readonly fields: FieldRef<T>[]) {}

  evaluate(value: T, _context: JobContext): QualityRuleResult {
    const issues: QualityIssue[] = [];

    for (const field of this.fields) {
      if (isMissing(field.get(value))) {
        issues.push({
          code: "required-field-missing",
          field: field.label,
          message: `Campo obrigatório "${field.label}" está ausente ou vazio.`,
          severity: "error",
        });
      }
    }

    return { ruleId: this.id, issues };
  }
}
