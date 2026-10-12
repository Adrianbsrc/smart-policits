# collectors/

Ponto de extensão para implementações concretas de `Collector<TRaw, TParams>`
(contrato em `../contracts/collector.contract.ts`), uma por Source.

`collectors/tse/` é o primeiro Collector real (`TseCollector`) — candidatos à
Presidência, patrimônio declarado, partido e situação da candidatura do TSE.
Depende apenas da porta `TseDataSource`; hoje só existe `TseFixtureDataSource`
(fixtures/tse/*.json) — nenhuma chamada HTTP real ainda. Use-o como referência
para o próximo Collector (ex. `collectors/ibge/ibge.collector.ts`).

Cada Collector novo deve:

1. Implementar `Collector<TRaw, TParams>`.
2. Ser registrado em um `CollectorRegistry` (`../jobs/collector-registry.ts`)
   com o mesmo `id` da `SourceDefinition` correspondente
   (`../sources/source.contract.ts`).

Nenhuma alteração em `../jobs/etl-pipeline.ts` é necessária para adicionar uma
nova fonte.
