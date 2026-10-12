import type { JobContext } from "./job.contract";

/**
 * Converte dados brutos de uma fonte para o contrato interno (docs/SPECs/etl.md#2-normalize).
 * Nenhum serviço interno deve conhecer o formato original da fonte externa —
 * esse conhecimento fica isolado no par Collector + Normalizer.
 */
export interface Normalizer<TRaw = unknown, TNormalized = unknown> {
  normalize(raw: TRaw, context: JobContext): Promise<TNormalized> | TNormalized;
}
