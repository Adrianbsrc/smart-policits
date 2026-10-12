import type { JobLogger } from "../shared/job-logger";
import type { PipelineStage } from "../shared/pipeline-stage";

/** Contexto compartilhado entre todas as etapas de uma execução de Job. */
export interface JobContext {
  readonly jobId: string;
  readonly sourceId: string;
  readonly startedAt: Date;
  readonly logger: JobLogger;
}

export type JobStatus = "success" | "partial" | "failed";

export interface JobErrorEntry {
  readonly stage: PipelineStage;
  readonly message: string;
  readonly itemIndex?: number;
}

/** Resultado consolidado de uma execução de Job (docs/SPECs/etl.md#logs). */
export interface JobResult {
  readonly jobId: string;
  readonly sourceId: string;
  readonly status: JobStatus;
  readonly startedAt: Date;
  readonly finishedAt: Date;
  readonly durationMs: number;
  readonly recordsCollected: number;
  readonly recordsValid: number;
  readonly recordsWritten: number;
  readonly recordsSkipped: number;
  readonly errors: JobErrorEntry[];
}

/**
 * Unidade executável e orquestrável do ETL. Uma implementação típica (ver
 * jobs/etl-pipeline.ts) encadeia Collector → Normalizer → Validator →
 * Enricher → Writer para uma única Source.
 */
export interface Job<TParams = void> {
  readonly id: string;
  readonly sourceId: string;
  run(params: TParams): Promise<JobResult>;
}
