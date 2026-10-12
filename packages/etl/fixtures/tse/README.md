# fixtures/tse/

Exemplos estáticos da API pública do TSE (DivulgaCandContas —
https://divulgacandcontas.tse.jus.br/divulga/rest/v1/), usados pelo
`TseFixtureDataSource` (`../../src/collectors/tse/tse-fixture-data-source.ts`)
no lugar de chamadas HTTP reais. Formato idêntico ao das respostas reais
(`TseCandidatosResponse`/`TseBensResponse`, ver
`../../src/sources/tse/tse.types.ts`).

## O que é real e o que é ilustrativo

- **Reais**: nomes de candidatos, siglas/números de partido, número na urna,
  cargo e situação da candidatura — fatos públicos do 1º turno de 2022
  (mesmos candidatos já usados em `src/seeds/politicians.ts`).
- **Ilustrativos**: `id` do candidato (sqcand) e os valores/itens de
  patrimônio. Não são os sqcand nem os valores oficiais reais declarados —
  são dados de teste plausíveis, para exercitar o pipeline sem afirmar
  fatos financeiros não verificados. Usar apenas para testar arquitetura.

## Convenção de nomes

- `candidatos-{ano}-{uf}-{codigoCargo}.json` — resposta de
  `GET /candidatura/listar/{ano}/{uf}/{codigoCargo}/{pagina}/candidatos`
  (sempre página 1 nestes fixtures).
- `bens-{ano}-{uf}-{codigoCargo}-{sqcand}.json` — resposta de
  `GET /candidatura/listar/{ano}/{uf}/{codigoCargo}/{sqcand}/bens`.

## Casos cobertos

- `F2022-001` (Lula/PT) e `F2022-002` (Bolsonaro/PL): candidatura apta, com bens.
- `F2022-003` (Ciro Gomes/PDT): candidatura apta, com bens de categorias variadas.
- `F2022-004` (Simone Tebet/MDB): candidatura apta, **sem bens declarados**
  (`totalDeBens` vazio e `lista` vazia) — cobre o caso real documentado em
  `tse.client.ts` ("Retorna array vazio se candidato não declarou bens").
