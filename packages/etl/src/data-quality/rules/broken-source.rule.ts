import type { JobContext } from "../../contracts/job.contract";
import type { FieldRef } from "../contracts/field-ref.contract";
import type { QualityRule, QualityRuleResult } from "../contracts/quality-rule.contract";
import type { QualityIssue } from "../models/quality-issue.model";

function isValidUrl(raw: string): boolean {
  try {
    new URL(raw);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica se um campo que deveria referenciar uma fonte é uma URL bem
 * formada. "Quebrada" aqui é estrutural (vazia/malformada) — checar
 * disponibilidade real (HTTP) é responsabilidade de outra etapa; o
 * QualityEngine avalia dado já coletado, sem rede.
 */
export class BrokenSourceRule<T> implements QualityRule<T> {
  readonly id = "broken-source";

  constructor(private readonly fields: FieldRef<T, string | null | undefined>[]) {}

  evaluate(value: T, _context: JobContext): QualityRuleResult {
    const issues: QualityIssue[] = [];

    for (const field of this.fields) {
      const url = field.get(value);
      if (!url || !isValidUrl(url)) {
        issues.push({
          code: "broken-source",
          field: field.label,
          message: `Campo "${field.label}" não é uma URL de fonte válida (${url ? `"${url}"` : "vazio"}).`,
          severity: "error",
        });
      }
    }

    return { ruleId: this.id, issues };
  }
}
