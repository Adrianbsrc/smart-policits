import type { Collector } from "../contracts/collector.contract";
import type { Normalizer } from "../contracts/normalizer.contract";
import type { Validator } from "../contracts/validator.contract";
import type { Enricher } from "../contracts/enricher.contract";
import type { Writer } from "../contracts/writer.contract";
import type { Job, JobContext, JobErrorEntry, JobResult, JobStatus } from "../contracts/job.contract";
import { InMemoryJobLogger } from "../shared/job-logger";
import { JobError } from "../shared/job-error";
import type { PipelineStage } from "../shared/pipeline-stage";

export interface EtlPipelineStages<TRaw, TNormalized, TEnriched, TParams = void> {
  readonly collector: Collector<TRaw, TParams>;
  readonly normalizer: Normalizer<TRaw, TNormalized>;
  readonly validator: Validator<TNormalized>;
  readonly enricher: Enricher<TNormalized, TEnriched>;
  readonly writer: Writer<TEnriched>;
}

/**
 * Orquestra o fluxo Collector → Normalizer → Validator → Enricher → Writer
 * para uma única Source (docs/SPECs/etl.md#pipeline).
 *
 * Cada etapa é recebida por interface, então pode ser substituída sem alterar
 * esta classe — inclusive o Collector, que tipicamente vem de um
 * CollectorRegistry (ver collector-registry.ts) em vez de ser instanciado aqui.
 * Um item reprovado na validação é descartado sem interromper os demais, para
 * que uma fonte com dado ruim nunca bloqueie o restante do lote.
 */
export class EtlPipeline<TRaw, TNormalized, TEnriched, TParams = void> implements Job<TParams> {
  constructor(
    readonly id: string,
    readonly sourceId: string,
    private readonly stages: EtlPipelineStages<TRaw, TNormalized, TEnriched, TParams>,
  ) {}

  async run(params: TParams): Promise<JobResult> {
    const startedAt = new Date();
    const logger = new InMemoryJobLogger();
    const context: JobContext = { jobId: this.id, sourceId: this.sourceId, startedAt, logger };
    const errors: JobErrorEntry[] = [];

    let recordsCollected = 0;
    let recordsValid = 0;
    let recordsWritten = 0;
    let recordsSkipped = 0;

    try {
      const collected = await this.runStage("collect", () => this.stages.collector.collect(params, context));
      recordsCollected = collected.items.length;
      logger.info(`Coletados ${recordsCollected} itens.`, { sourceId: this.sourceId });

      const toWrite: TEnriched[] = [];

      for (let index = 0; index < collected.items.length; index += 1) {
        const rawItem = collected.items[index] as TRaw;
        try {
          const normalized = await this.runStage("normalize", () =>
            this.stages.normalizer.normalize(rawItem, context),
          );
          const validation = await this.runStage("validate", () =>
            this.stages.validator.validate(normalized, context),
          );

          if (!validation.valid) {
            recordsSkipped += 1;
            logger.warn("Item reprovado na validação.", { sourceId: this.sourceId, index, issues: validation.issues });
            continue;
          }

          recordsValid += 1;
          const enriched = await this.runStage("enrich", () =>
            this.stages.enricher.enrich(validation.data, context),
          );
          toWrite.push(enriched);
        } catch (cause) {
          recordsSkipped += 1;
          errors.push(this.toErrorEntry(cause, index));
        }
      }

      const writeResult = await this.runStage("write", () => this.stages.writer.write(toWrite, context));
      recordsWritten = writeResult.written;
      recordsSkipped += writeResult.skipped;

      return this.buildResult(startedAt, false, recordsCollected, recordsValid, recordsWritten, recordsSkipped, errors);
    } catch (cause) {
      errors.push(this.toErrorEntry(cause));
      return this.buildResult(startedAt, true, recordsCollected, recordsValid, recordsWritten, recordsSkipped, errors);
    }
  }

  private buildResult(
    startedAt: Date,
    pipelineThrew: boolean,
    recordsCollected: number,
    recordsValid: number,
    recordsWritten: number,
    recordsSkipped: number,
    errors: JobErrorEntry[],
  ): JobResult {
    const finishedAt = new Date();
    return {
      jobId: this.id,
      sourceId: this.sourceId,
      status: pipelineThrew ? "failed" : this.resolveStatus(errors, recordsCollected),
      startedAt,
      finishedAt,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      recordsCollected,
      recordsValid,
      recordsWritten,
      recordsSkipped,
      errors,
    };
  }

  private resolveStatus(errors: JobErrorEntry[], recordsCollected: number): JobStatus {
    if (errors.length === 0) return "success";
    if (recordsCollected > 0 && errors.length < recordsCollected) return "partial";
    return "failed";
  }

  private async runStage<T>(stage: PipelineStage, fn: () => Promise<T> | T): Promise<T> {
    try {
      return await fn();
    } catch (cause) {
      if (cause instanceof JobError) throw cause;
      throw new JobError(stage, cause instanceof Error ? cause.message : String(cause), cause);
    }
  }

  private toErrorEntry(cause: unknown, itemIndex?: number): JobErrorEntry {
    if (cause instanceof JobError) {
      return { stage: cause.stage, message: cause.message, itemIndex };
    }
    const message = cause instanceof Error ? cause.message : String(cause);
    return { stage: "collect", message, itemIndex };
  }
}
