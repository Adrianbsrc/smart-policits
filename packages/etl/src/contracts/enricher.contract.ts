import type { JobContext } from "./job.contract";

/**
 * Categoriza, resume ou relaciona entidades de um registro já validado
 * (docs/SPECs/etl.md#4-enrich). Pode usar IA, mas a IA nunca cria, altera
 * ou remove fatos — apenas deriva metadados a partir do que já foi validado.
 */
export interface Enricher<TValidated = unknown, TEnriched = TValidated> {
  enrich(data: TValidated, context: JobContext): Promise<TEnriched> | TEnriched;
}
