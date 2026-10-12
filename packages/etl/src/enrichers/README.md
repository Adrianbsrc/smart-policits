# enrichers/

Ponto de extensão para implementações concretas de `Enricher<TValidated, TEnriched>`
(contrato em `../contracts/enricher.contract.ts`) — categorização, resumo e
relacionamento de entidades. Pode usar IA (`@smart-politics/intelligence`),
mas a IA nunca cria, altera ou remove fatos.

Nenhuma implementação concreta neste momento — nem de IA, nem determinística
(docs/SPECs/etl.md). Apenas a interface existe hoje.
