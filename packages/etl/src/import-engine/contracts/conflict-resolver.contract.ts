/** Um campo em que o valor recebido diverge do valor já persistido. */
export interface FieldConflict {
  field: string;
  incomingValue: unknown;
  currentValue: unknown;
}

export type ConflictResolutionStrategy = "keep_current" | "use_incoming" | "manual";

export interface ConflictResolution {
  field: string;
  resolvedValue: unknown;
  strategy: ConflictResolutionStrategy;
}

/**
 * Extension point preparado, sem implementação nesta task. Decide, campo a
 * campo, o que fazer quando um UPDATE/MERGE encontra valores divergentes
 * entre o candidato recebido e o registro já persistido — nunca sobrescrever
 * "às cegas" (docs/SPECs/etl.md#5-persist: "Nunca sobrescrever registros
 * importantes").
 */
export interface ConflictResolver<TCandidate> {
  resolveConflicts(candidate: TCandidate, conflicts: FieldConflict[]): Promise<ConflictResolution[]>;
}
