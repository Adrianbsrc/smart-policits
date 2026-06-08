# Smart Politics — Guia para Claude

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js App Router (web app em `apps/web`) |
| Backend | NestJS (API em `apps/api`) |
| ORM | Prisma 7 — client gerado em `packages/db/generated/prisma` |
| Banco | PostgreSQL via Supabase |
| Auth | Supabase JWT → guard NestJS valida Bearer token |
| Monorepo | pnpm workspaces + Turborepo |
| Linguagem | TypeScript strict (sem `any`) |
| Estilo | Tailwind + shadcn/ui |

## Estrutura do monorepo

```
apps/
  api/          NestJS — porta 3001
  web/          Next.js — porta 3000

packages/
  db/           Prisma schema + migrations + seed + client gerado
  etl/          Sync Câmara (REST) e Senado (SPARQL/REST)
  intelligence/ Providers de IA plugáveis (Claude, OpenAI, Mock, Manual)
  scoring/      Motor de score (v2.0.0) com dimensões temáticas + pilares
  auth/         Helpers Supabase (client browser/server)
  types/        Tipos compartilhados
  ui/           Componentes shadcn/ui base
  config/       ESLint, tsconfig base
```

## Módulos NestJS (apps/api/src/modules/)

`auth` · `users` · `politicians` · `parties` · `feed` · `rankings` · `alerts` · `follows` · `quiz` · `etl` · `intelligence` · `health`

Cada módulo segue: `module → controller → service → repository → dto`

## Rotas do frontend (apps/web/src/)

```
components/   Componentes puros — sem lógica de negócio
features/     auth
hooks/        Hooks customizados
lib/          api/ (server + services), supabase/, content/
services/     Chamadas de API para o NestJS
```

## Banco de dados — modelos principais

- **Politician** — `id`, `slug`, `office` (Office enum), `state`, `status` (PoliticianStatus), `tseId`, `candidateNumber`, `fichaLimpaIneligible`, `dataSource` (api|manual|hybrid)
- **Score** — 1:1 com Politician; `overall` + 12 dimensões temáticas + 4 pilares estruturais + `integrityMultiplier`; `scoreType` (mock|partial|real)
- **PoliticianFact** — fatos verificados (court_case, conviction, controversy, achievement, statement, position)
- **Interpretation** — cache de interpretações IA; deduplicação por `inputHash` (SHA-256)
- **User** — ligado a `supabaseId`; roles: user|admin|moderator
- **Follow**, **Alert**, **QuizResult**, **FeedItem**, **Party**

## Enums relevantes

```ts
Office: president | governor | senator | federal_deputy | state_deputy
PoliticianStatus: pre_candidate | candidate | elected | in_mandate | former | inactive
ScoreType: mock | partial | real
PartyIdeology: far_left | left | center_left | center | center_right | right | far_right
```

## Packages/intelligence

Providers plugáveis para IA: `ClaudeProvider`, `OpenAIProvider`, `MockProvider`, `ManualProvider`.
Pipelines: `InterpretBill`, `ClassifyTopic`, `SummarizeProposal`, `GenerateStory`, `DetectRelevance`.
Validação com Zod em todos os inputs/outputs.
`Interpretation` model no DB faz cache por `inputHash`.

## ETL

- `packages/etl/src/sources/camara/` — API da Câmara (REST)
- `packages/etl/src/sources/` + `sync/senado.ts` — API do Senado
- `packages/etl/src/normalize/` — normalização para modelo interno
- `packages/etl/src/builders/score-input-builder.ts` — prepara input para scoring
- Scripts: `pnpm --filter @smart-politics/etl sync:camara` / `sync:senado`

## Comandos úteis

```bash
pnpm dev                     # inicia api + web em paralelo
pnpm db:migrate              # roda migrações Prisma
pnpm db:studio               # Prisma Studio
pnpm db:generate             # regenera client Prisma
pnpm --filter @smart-politics/db db:seed
```

## Padrões obrigatórios

- Clean Architecture: lógica **nunca** no componente visual
- Componentes puramente visuais, lógica em hooks/services
- Mobile first + acessibilidade
- Segurança by default — todos os endpoints autenticados por padrão; usar `@Public()` só quando necessário
- Sem `any` — usar tipos do `packages/types` ou inferência Prisma
- Sem duplicação — verificar se já existe antes de criar
- Cache no NestJS: in-memory 15 min, 500 entradas max (sem Redis)
- Rate limit: 100 req/min (default), 10 req/s (short)

## Proibido

- `any`
- Lógica no componente visual
- Endpoints públicos sem justificativa
- Duplicação de código
- Gambiarra / workaround sem comentário explicando o porquê
