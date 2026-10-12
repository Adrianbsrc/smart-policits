import type { QualityRule } from "./quality-rule.contract";

/**
 * Extension point preparado, sem implementação nesta task, para "regras
 * específicas por domínio" e "regras específicas por fonte". Um domínio
 * (ex.: political-profile) ou uma fonte (ex.: TSE) implementa isto para
 * contribuir regras adicionais — genéricas reconfiguradas ou totalmente
 * próprias — sem que `data-quality/` jamais precise importá-los.
 */
export interface QualityRuleProvider<T> {
  provideRules(): QualityRule<T>[];
}
