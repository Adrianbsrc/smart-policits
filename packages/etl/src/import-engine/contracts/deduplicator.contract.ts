/** Grupo de registros já existentes que o Deduplicator considera serem a mesma entidade. */
export interface DuplicateGroup<TEntityId = string> {
  entityIds: TEntityId[];
  reason: string;
}

/**
 * Extension point preparado, sem implementação nesta task. Enquanto
 * `EntityResolver` compara um candidato contra a base, `Deduplicator` olha
 * para registros já persistidos entre si — útil quando `EntityResolver`
 * devolve múltiplos matches de alta confiança para um mesmo candidato,
 * sinalizando que a própria base já tem duplicatas a consolidar.
 */
export interface Deduplicator<TCandidate, TEntityId = string> {
  findDuplicates(candidate: TCandidate, existingIds: TEntityId[]): Promise<DuplicateGroup<TEntityId>[]>;
}
