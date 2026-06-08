import type { IntelligenceProvider } from "../interfaces/intelligence-provider.interface";
import type { CoverageDirection, InterpretationInput } from "../types/interpretation.types";

export interface RelevanceResult {
  relevance_score:    number;
  coverage_direction: CoverageDirection;
}

/**
 * Pipeline de detecção de relevância política.
 * Retorna score 0–100 e direção de cobertura para priorização no feed.
 *
 * `coverage_direction` descreve a DIREÇÃO DA MUDANÇA (expansivo/restritivo),
 * sem julgamento de valor sobre se a mudança é boa ou ruim.
 */
export class DetectRelevancePipeline {
  constructor(private readonly provider: IntelligenceProvider) {}

  async run(input: InterpretationInput): Promise<RelevanceResult> {
    const result = await this.provider.interpret(input);

    return {
      relevance_score:    result.relevance_score,
      coverage_direction: result.coverage_direction,
    };
  }
}
