import type { ImportCandidate } from "../contracts/import-candidate.contract";
import type { ImportContext } from "../contracts/import-context.contract";
import type { ImportDecision } from "../contracts/import-decision.contract";
import { ImportDecisionFactory } from "../decisions/import-decision.factory";
import type { ImportStrategyRegistry } from "./import-strategy-registry";

/**
 * Ponto único de entrada do Import Engine (docs/SPECs/etl.md). Recebe um
 * ImportCandidate<T> vindo do pipeline ETL (Collector → Normalizer →
 * Validator → Enricher) e devolve uma ImportDecision — nunca grava nada.
 *
 * Nunca precisa mudar para suportar um novo tipo de candidato: apenas
 * despacha para a ImportStrategy registrada sob `candidate.type`
 * (Open/Closed — ver ImportStrategyRegistry).
 */
export class ImportEngine {
  constructor(private readonly strategies: ImportStrategyRegistry) {}

  async decide<T>(
    candidate: ImportCandidate<T>,
    context: ImportContext<T> = {},
  ): Promise<ImportDecision> {
    if (!this.strategies.has(candidate.type)) {
      return ImportDecisionFactory.manualReview(
        `Nenhuma ImportStrategy registrada para o tipo "${candidate.type}" — candidato não pode ser decidido automaticamente.`,
      );
    }

    const strategy = this.strategies.get<T>(candidate.type);
    return strategy.decide(candidate, context);
  }
}
