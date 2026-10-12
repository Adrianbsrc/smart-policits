import type { ConflictResolver } from "./conflict-resolver.contract";
import type { Deduplicator } from "./deduplicator.contract";
import type { EntityResolver } from "./entity-resolver.contract";

/**
 * Colaboradores opcionais que uma ImportStrategy pode consultar durante
 * `decide()`. Hoje sempre ausentes (undefined) — nenhum acessa banco nesta
 * task. Quando EntityResolver/Deduplicator/ConflictResolver ganharem
 * implementação real, plugam aqui: nem `ImportEngine` nem as strategies já
 * escritas precisam mudar de assinatura.
 */
export interface ImportContext<TCandidate, TEntityId = string> {
  entityResolver?: EntityResolver<TCandidate, TEntityId>;
  deduplicator?: Deduplicator<TCandidate, TEntityId>;
  conflictResolver?: ConflictResolver<TCandidate>;
}
