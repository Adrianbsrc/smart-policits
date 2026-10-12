import type { CollectResult, Collector, CollectorMetadata } from "../../contracts/collector.contract";
import type { JobContext } from "../../contracts/job.contract";
import type { TseBem, TseCandidato } from "../../sources/tse/tse.types";
import type { TseDataSource } from "./tse-data-source";

/** 1 = Presidente da República (ver códigos de cargo em ../../sources/tse/tse.client.ts). */
const PRESIDENTIAL_OFFICE_CODE = 1;
const NATIONAL_UF = "BR";

export interface TseCollectorParams {
  /** Um ou mais anos eleitorais a coletar — cada ano gera candidaturas independentes (ver docs/SPECs/etl.md). */
  anos: number[];
}

/** Uma candidatura de um ano específico: dados do candidato + patrimônio declarado naquele ano. */
export interface TseRawCandidacy {
  ano: number;
  candidato: TseCandidato;
  bens: TseBem[];
}

/**
 * Primeiro Collector real da plataforma (docs/SPECs/etl.md#1-collect).
 * Obtém candidatos à Presidência, patrimônio declarado, partido e situação
 * da candidatura do TSE — um ano por vez; coletar vários anos (`params.anos`)
 * é como a arquitetura cobre "eleições disputadas" por uma mesma pessoa,
 * já que o TSE não expõe um identificador estável entre pleitos diferentes
 * (o `id`/sqcand muda a cada eleição) — unificar candidaturas da mesma
 * pessoa ao longo do tempo é responsabilidade de uma etapa futura
 * (Writer/resolução de entidade), não deste Collector.
 *
 * Depende apenas de `TseDataSource` (porta) — nunca de HTTP, arquivo ou
 * qualquer outra fonte além do TSE.
 */
export class TseCollector implements Collector<TseRawCandidacy, TseCollectorParams> {
  readonly metadata: CollectorMetadata = { id: "tse-presidential-candidates", sourceId: "tse" };

  constructor(private readonly dataSource: TseDataSource) {}

  async collect(params: TseCollectorParams, context: JobContext): Promise<CollectResult<TseRawCandidacy>> {
    const items: TseRawCandidacy[] = [];

    for (const ano of params.anos) {
      context.logger.info(`Coletando candidatos à Presidência — ${ano}`, {
        sourceId: this.metadata.sourceId,
        ano,
      });

      const candidatos = await this.dataSource.listCandidatos({
        ano,
        uf: NATIONAL_UF,
        codigoCargo: PRESIDENTIAL_OFFICE_CODE,
      });

      for (const candidato of candidatos) {
        const bens = await this.dataSource.listBens({
          ano,
          uf: NATIONAL_UF,
          codigoCargo: PRESIDENTIAL_OFFICE_CODE,
          sqcand: candidato.id,
        });

        items.push({ ano, candidato, bens });
      }
    }

    return { sourceId: this.metadata.sourceId, collectedAt: new Date(), items };
  }
}
