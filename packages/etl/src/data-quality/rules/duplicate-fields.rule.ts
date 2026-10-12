import type { JobContext } from "../../contracts/job.contract";
import type { ArrayFieldRef } from "../contracts/field-ref.contract";
import type { QualityRule, QualityRuleResult } from "../contracts/quality-rule.contract";
import type { QualityIssue } from "../models/quality-issue.model";

function defaultKeyOf(item: unknown): string {
  return JSON.stringify(item);
}

/**
 * Verifica se um campo de lista (ex.: assets, tags, categories) contém
 * itens duplicados dentro do próprio objeto normalizado. Genérica: recebe
 * `ArrayFieldRef<T>[]` — nunca sabe o que é um "asset".
 */
export class DuplicateFieldsRule<T> implements QualityRule<T> {
  readonly id = "duplicate-fields";

  constructor(private readonly fields: ArrayFieldRef<T>[]) {}

  evaluate(value: T, _context: JobContext): QualityRuleResult {
    const issues: QualityIssue[] = [];

    for (const field of this.fields) {
      const items = field.get(value);
      const keyOf = field.keyOf ?? defaultKeyOf;
      const counts = new Map<string, number>();

      for (const item of items) {
        const key = keyOf(item);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }

      const duplicateCount = Array.from(counts.values()).filter((count) => count > 1).length;
      if (duplicateCount > 0) {
        issues.push({
          code: "duplicate-items",
          field: field.label,
          message: `Campo "${field.label}" tem ${duplicateCount} valor(es) repetido(s).`,
          severity: "warning",
        });
      }
    }

    return { ruleId: this.id, issues };
  }
}
