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

`auth` · `users` · `politicians` · `parties` · `feed` · `rankings` · `alerts` · `follows` · `quiz` · `etl` · `intelligence` · `health` · `timeline` · `promises` · `expenses` · `assets` · `political-profiles` · `political-parties` · `political-offices` · `political-affiliations` · `mandates`

Cada módulo segue: `module → controller → service → repository → dto`

### Domínio PoliticalProfile (V1)

`political-profiles` · `political-parties` · `political-offices` · `political-affiliations` · `mandates` são entidades **novas e independentes** de `Politician`/`Party` (ver `docs/SPECs/political-profile.md`) — não substituem nem migram dados do modelo legado. `PoliticalProfile` é a entidade central planejada para o domínio (RFC-004), mas ainda convive lado a lado com `Politician` enquanto ETL/Assessment/Timeline/Promises/Indicators não são portados.

Filiação partidária é histórica: `PoliticalProfile` não tem FK direta de partido — o partido atual é obtido via `PoliticalAffiliation` com `isCurrent: true` (no máximo uma por perfil, regra aplicada no `PoliticalAffiliationsService`).

`GET /profiles/:slug/executive-summary` retorna um DTO próprio (`ExecutiveSummaryResponseDto`, nunca o tipo Prisma) via `political-profiles.mapper.ts` — identificação + contagem de mandatos + experiência pública consolidada.

Frontend: feature `apps/web/src/features/political-profile/` em camadas — `api/` (fetch cru validado com Zod) → `mappers/` (DTO → Model) → `services/` (orquestração) → `hooks/` → `components/` (só conhecem Models, nunca DTOs). `validations/` é a fonte da verdade dos schemas; `types/*.dto.ts` derivam `z.infer` deles. Rota `/profile/[slug]` (App Router, Server Component). Ver RFC-009.

`GET /profiles/:slug/timeline` e `GET /profiles/:slug/promises` seguem o mesmo padrão de DTO+Mapper, em módulos próprios (`political-timeline`, `political-promises`) — nenhum dos dois retorna tipo Prisma. Timeline sintetiza eventos a partir de Mandate/PoliticalAffiliation/PoliticalProfile (importância vem de `TimelineImportanceResolver`, nunca calculada no mapper). Promises ainda não tem fonte de dados (sem ETL/tabela própria) — `PoliticalPromisesService.fetchPromisesForProfile` é o único ponto que muda quando essa fonte existir; domínio (`domain/promise.entity.ts` — nomeado `PromiseEntity`, não `Promise`, para não sombrear o tipo global)/DTO/mapper/controller/frontend já estão prontos. Frontend: `features/timeline/` e `features/promises/` seguem `api/ → mappers/ → models/ → hooks/ → components/` (sem `services/`), com filtro/expand/agrupamento 100% client-side (zero refetch).

**Shared Kernel**: `packages/core/src/domain/` (`Source`, `AuditInfo`) — Value Objects usados por backend (`SourceDto implements Source` em `apps/api/src/common/dto/source.dto.ts`) e frontend (`Source` importado direto de `@smart-politics/core` nos Models). Nunca duplicar esses VOs localmente em um módulo/feature.

`GET /profiles/:slug/indicators` segue o mesmo padrão ETL-ready de Promises (`PoliticalIndicatorsService.fetchIndicatorsForProfile` retorna `[]` até existir fonte de dados). Domínio: `Indicator`, `IndicatorValue`, `IndicatorCategory` em `apps/api/src/modules/political-indicators/domain/`.

Frontend de `features/indicators/` introduz uma camada extra — View Model — como padrão de referência para features futuras: `api/` (DTO) → `mappers/` (DTO → Domain Model, em `models/`, sem nenhuma label/formatação) → `view-models/` (ViewModel Mapper: Domain Model → View Model, aqui sim vivem labels/cores/strings formatadas) → `hooks/` (devolve View Model pronto) → `components/` (só conhece View Model). Domain Model nunca conhece UI; View Model nunca importa de `validations/`/`api/`.

**Query Objects**: toda feature em `apps/web/src/features/*/queries/` expõe uma classe `Get<Recurso>Query implements Query<TParams, TResult>` (interface em `apps/web/src/lib/queries/query.ts`) — encapsula o pipeline inteiro (api → dto → mapper → ... → resultado final) atrás de `execute()`. Hooks (`use-*.ts`) só chamam `queryObject.execute(...)` dentro do `queryFn` do react-query; nunca reimplementam a orquestração. Presente em `indicators`, `timeline`, `promises` e `integrity` — toda feature nova deve seguir esse padrão.

`GET /profiles/:slug/integrity` segue o mesmo padrão ETL-ready (`PoliticalIntegrityService.fetchIntegrityRecordsForProfile` retorna `[]` até existir integração com STF/STJ/TCU/CGU). Regra de UX obrigatória: nenhum status processual (`investigation | archived | acquitted | convicted | ongoing | unknown`) recebe cor semântica ou destaque — todos usam `Badge variant="outline"` — e nenhum é ocultado (nunca esconder absolvições/arquivamentos/investigações). "A plataforma informa, o usuário conclui."

As features anteriores a Indicators (`political-profile`, `timeline`, `promises`) ainda não foram migradas para o padrão View Model — não é necessário até que sejam tocadas novamente. Todas (incluindo essas três) já usam Query Objects.

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
- **PoliticalProfile** — `id`, `slug`, `fullName`, `displayName`, `currentOfficeId` → PoliticalOffice, `status` (PoliticalProfileStatus), `isCandidate`, `isIncumbent`; possui `mandates` (1:N `Mandate`) e `affiliations` (1:N `PoliticalAffiliation`, filiação atual = `isCurrent: true`)
- **PoliticalAffiliation** — histórico de filiação partidária (`profileId`, `partyId`, `startDate`, `endDate`, `isCurrent`, `reason`); no máximo uma `isCurrent: true` por perfil (regra aplicada na camada de service)
- **PoliticalParty**, **PoliticalOffice**, **Mandate** — domínio novo e independente de Politician/Party (ver seção "Domínio PoliticalProfile" acima). `Mandate` carrega `electionYear`, `electionRound`, `votes`, `electoralResult`, `startReason`, `endReason` e `viceProfileId` (auto-relação com PoliticalProfile)

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
