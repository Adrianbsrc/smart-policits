import type { PipelineStage } from "./pipeline-stage";

/** Erro ocorrido em uma etapa específica do pipeline, preservando a causa original. */
export class JobError extends Error {
  constructor(
    public readonly stage: PipelineStage,
    message: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "JobError";
  }
}
