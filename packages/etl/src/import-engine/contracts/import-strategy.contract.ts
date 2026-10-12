import type { ImportCandidate } from "./import-candidate.contract";
import type { ImportContext } from "./import-context.contract";
import type { ImportDecision } from "./import-decision.contract";

/**
 * Decide como um ImportCandidate<T> deve entrar na plataforma — nunca
 * executa a ação, apenas decide (ver docs/SPECs/etl.md#5-persist, que fica
 * a cargo de uma etapa futura). Uma implementação por tipo de candidato
 * (`type`); adicionar uma nova nunca exige alterar `ImportEngine` nem as
 * strategies já existentes — apenas registrar a nova em
 * `ImportStrategyRegistry` (Open/Closed).
 */
export interface ImportStrategy<T> {
  /** Deve ser igual ao `type` dos ImportCandidate que esta strategy trata. */
  readonly type: string;
  decide(candidate: ImportCandidate<T>, context: ImportContext<T>): Promise<ImportDecision> | ImportDecision;
}
