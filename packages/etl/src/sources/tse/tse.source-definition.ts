import type { SourceDefinition } from "../source.contract";

/**
 * Metadados da fonte TSE (docs/SPECs/sources.md#tse) — candidatos, patrimônio,
 * eleições, partidos e prestações de contas, periodicidade Eleitoral.
 * `collectorId` referencia `TseCollector.metadata.id`
 * (../../collectors/tse/tse.collector.ts).
 */
export const TSE_SOURCE_DEFINITION: SourceDefinition = {
  id: "tse",
  name: "TSE DivulgaCandContas",
  organization: "Tribunal Superior Eleitoral",
  type: "api",
  baseUrl: "https://divulgacandcontas.tse.jus.br/divulga/rest/v1",
  documentationUrl: "https://divulgacandcontas.tse.jus.br/divulga/#/",
  updateFrequency: "electoral",
  reliability: "official",
  status: "active",
  collectorId: "tse-presidential-candidates",
  notes: "Coleta hoje via fixtures (fixtures/tse/) — ainda não conectada à API real.",
};
