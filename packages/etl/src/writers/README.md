# writers/

`writers/political-profile/` é a primeira persistência real do ETL —
`PrismaPoliticalProfileWriter` grava `PoliticalProfile`/`PoliticalAffiliation`/
`Mandate` a partir de um `PoliticalProfileCandidate` já aprovado pelo Import
Engine. Nunca escreve fora do que a `ImportDecision.action` autoriza (ver
`political-profile-writer.ts`), e todo UPDATE passa por uma lista explícita
de campos permitidos (`political-profile-update-fields.ts`).

Use-o como referência para o próximo Writer (ex. `writers/promise/`,
quando Promises ganhar fonte de dados).

Este módulo não implementa o contrato genérico `Writer<TEnriched>`
(`../contracts/writer.contract.ts`) porque precisa do par (candidato,
ImportDecision) por item, não só do item enriquecido — ver
`political-profile-writer.contract.ts`.
