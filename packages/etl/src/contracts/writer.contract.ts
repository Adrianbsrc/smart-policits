import type { JobContext } from "./job.contract";

export interface WriteResult {
  readonly written: number;
  readonly skipped: number;
  readonly errors: number;
}

/**
 * Persiste registros enriquecidos (docs/SPECs/etl.md#5-persist). Deve manter
 * histórico e nunca sobrescrever registros importantes — a estratégia de
 * versionamento (ver shared/version-info.ts) fica a cargo da implementação concreta.
 */
export interface Writer<TEnriched = unknown> {
  write(items: TEnriched[], context: JobContext): Promise<WriteResult>;
}
