import type { QualityRule } from "../contracts/quality-rule.contract";

export interface QualityRuleRegistry<T> {
  register(rule: QualityRule<T>): void;
  list(): QualityRule<T>[];
}

/**
 * Diferente de um registry por chave (ex.: ImportStrategyRegistry, ver
 * ../../import-engine/services/import-strategy-registry.ts): aqui todas as
 * regras registradas rodam para todo objeto avaliado — não existe "uma
 * regra por tipo", porque avaliação de qualidade não é mutuamente
 * exclusiva (várias regras se aplicam ao mesmo objeto ao mesmo tempo).
 */
export class InMemoryQualityRuleRegistry<T> implements QualityRuleRegistry<T> {
  private readonly rules: QualityRule<T>[] = [];

  register(rule: QualityRule<T>): void {
    this.rules.push(rule);
  }

  list(): QualityRule<T>[] {
    return [...this.rules];
  }
}
