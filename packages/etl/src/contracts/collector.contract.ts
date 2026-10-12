import type { JobContext } from "./job.contract";

export interface CollectorMetadata {
  readonly id: string;
  readonly sourceId: string;
}

export interface CollectResult<TRaw> {
  readonly sourceId: string;
  readonly collectedAt: Date;
  readonly items: TRaw[];
}

/**
 * Busca dados brutos em uma fonte externa (docs/SPECs/etl.md#1-collect).
 * Não conhece o restante do pipeline — devolve apenas o formato original da fonte.
 */
export interface Collector<TRaw = unknown, TParams = void> {
  readonly metadata: CollectorMetadata;
  collect(params: TParams, context: JobContext): Promise<CollectResult<TRaw>>;
}
