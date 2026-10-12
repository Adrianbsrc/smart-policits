/** Uma correspondência entre um ImportCandidate e um registro já existente na plataforma. */
export interface EntityMatch<TEntityId = string> {
  entityId: TEntityId;
  /** 0 (sem semelhança) a 1 (mesma entidade). */
  score: number;
  /** Campos que geraram o match (ex.: ["fullName", "party.acronym"]) — auditável, nunca "caixa preta". */
  matchedOn: string[];
}

/**
 * Extension point preparado, sem implementação nesta task (não acessa
 * banco). Responsável por encontrar registros já existentes que podem
 * corresponder a um candidato — é o que permite uma ImportStrategy decidir
 * CREATE (nenhum match) vs. UPDATE/MERGE (match encontrado) em vez de
 * assumir sempre CREATE, que duplicaria dados.
 */
export interface EntityResolver<TCandidate, TEntityId = string> {
  resolve(candidate: TCandidate): Promise<EntityMatch<TEntityId>[]>;
}
