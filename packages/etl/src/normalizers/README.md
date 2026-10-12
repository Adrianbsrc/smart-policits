# normalizers/

Ponto de extensão para implementações concretas de `Normalizer<TRaw, TNormalized>`
(contrato em `../contracts/normalizer.contract.ts`) — converte o formato bruto
de uma Source para um contrato interno. Nenhum outro módulo deve conhecer o
formato original da fonte externa.

`normalizers/tse/` é o primeiro Normalizer real (`TseNormalizer`) — converte
`TseRawCandidacy` (formato do TSE) para `PoliticalProfileCandidate`
(`../domain/political-profile-candidate.ts`), o contrato interno de
candidatura. Use-o como referência para o próximo Normalizer.
