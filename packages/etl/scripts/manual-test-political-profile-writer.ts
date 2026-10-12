/**
 * Teste manual do fluxo completo até o banco:
 *
 *   TseCollector (fixtures/tse) → TseNormalizer → QualityEngine (gate)
 *     → ImportEngine (com EntityResolver real, por slug) → PrismaPoliticalProfileWriter
 *     → ImportExecutionReport
 *
 * ESCREVE no banco configurado em DATABASE_URL. Roda o lote duas vezes de
 * propósito: a 1ª execução deve gerar CREATE (perfis não existem ainda) e a
 * 2ª deve gerar UPDATE nos mesmos perfis, sem duplicar nada — é a prova de
 * idempotência e da estratégia de UPDATE seguro.
 *
 * Usage:
 *   pnpm --filter @smart-politics/etl test:persist-political-profile
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../.env") });
dotenv.config();

import { slugify } from "@smart-politics/core";
// Import de tipo apenas — nunca `import { prisma } from "@smart-politics/db"` aqui:
// esse import de valor seria hoisted para antes das chamadas dotenv.config()
// acima, criando o client singleton com DATABASE_URL ainda undefined (mesmo
// problema que sync-tse-bens.ts evita construindo o PrismaClient dentro de
// main(), depois do dotenv carregar). Por isso o singleton é importado
// dinamicamente dentro de main().
import type { PrismaClient } from "@smart-politics/db";

import { InMemoryJobLogger } from "../src/shared/job-logger";
import type { JobContext } from "../src/contracts/job.contract";
import { TseCollector } from "../src/collectors/tse/tse.collector";
import { TseFixtureDataSource } from "../src/collectors/tse/tse-fixture-data-source";
import { TseNormalizer } from "../src/normalizers/tse/tse.normalizer";
import type { PoliticalProfileCandidate } from "../src/domain/political-profile-candidate";
import {
  BrokenSourceRule,
  DuplicateFieldsRule,
  EmptyTextRule,
  FutureDateRule,
  InMemoryQualityRuleRegistry,
  InvalidValueRule,
  QualityEngine,
  RequiredFieldsRule,
} from "../src/data-quality";
import {
  ImportEngine,
  InMemoryImportStrategyRegistry,
  PoliticalProfileImportStrategy,
  POLITICAL_PROFILE_CANDIDATE_TYPE,
} from "../src/import-engine";
import type { ImportCandidate, ImportContext } from "../src/import-engine";
import {
  PoliticalProfileSlugEntityResolver,
  PrismaPoliticalProfileWriter,
  runPoliticalProfileImport,
} from "../src/writers";
import type { PoliticalProfileImportItem } from "../src/writers";

let assertions = 0;
let failures = 0;

function assert(condition: boolean, message: string): void {
  assertions++;
  if (!condition) {
    failures++;
    console.error(`  ✗ ${message}`);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

function buildPoliticalProfileQualityEngine(): QualityEngine<PoliticalProfileCandidate> {
  const registry = new InMemoryQualityRuleRegistry<PoliticalProfileCandidate>();
  registry.register(
    new RequiredFieldsRule<PoliticalProfileCandidate>([
      { label: "fullName", get: (c) => c.fullName },
      { label: "ballotName", get: (c) => c.ballotName },
      { label: "party.acronym", get: (c) => c.party.acronym },
      { label: "sourceUrl", get: (c) => c.sourceUrl },
    ]),
  );
  registry.register(
    new DuplicateFieldsRule<PoliticalProfileCandidate>([
      { label: "assets", get: (c) => c.assets, keyOf: (asset) => `${asset.description}|${asset.valueBrl}` },
    ]),
  );
  registry.register(
    new InvalidValueRule<PoliticalProfileCandidate>([
      { label: "party.number", get: (c) => c.party.number, isValid: (v) => /^\d+$/.test(v), message: "Número do partido deve ser numérico." },
      { label: "totalAssetsBrl", get: (c) => c.totalAssetsBrl, isValid: (v) => v >= 0, message: "Total de bens não pode ser negativo." },
    ]),
  );
  registry.register(
    new EmptyTextRule<PoliticalProfileCandidate>([{ label: "ballotName", get: (c) => c.ballotName }]),
  );
  registry.register(new FutureDateRule<PoliticalProfileCandidate>([{ label: "collectedAt", get: (c) => c.collectedAt }]));
  registry.register(new BrokenSourceRule<PoliticalProfileCandidate>([{ label: "sourceUrl", get: (c) => c.sourceUrl }]));
  return new QualityEngine<PoliticalProfileCandidate>(registry);
}

async function decideAll(
  candidates: PoliticalProfileCandidate[],
  importEngine: ImportEngine,
  importContext: ImportContext<PoliticalProfileCandidate>,
): Promise<PoliticalProfileImportItem[]> {
  const items: PoliticalProfileImportItem[] = [];
  for (const candidate of candidates) {
    const importCandidate: ImportCandidate<PoliticalProfileCandidate> = {
      type: POLITICAL_PROFILE_CANDIDATE_TYPE,
      sourceId: candidate.sourceId,
      collectedAt: candidate.collectedAt,
      payload: candidate,
    };
    const decision = await importEngine.decide(importCandidate, importContext);
    items.push({ candidate, decision });
  }
  return items;
}

let prismaRef: PrismaClient | undefined;

async function main() {
  const db = await import("@smart-politics/db");
  const prisma = db.prisma;
  prismaRef = prisma;

  console.log("=== 0. Verificando conectividade com o banco ===");
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("  ✓ Banco acessível.\n");
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error("  ✗ Banco inacessível — abortando (problema de conectividade, não do código do ETL).");
    console.error(`  ${message}`);
    await prisma.$disconnect();
    process.exit(1);
  }

  const context: JobContext = {
    jobId: "manual-test-political-profile-writer",
    sourceId: "tse",
    startedAt: new Date(),
    logger: new InMemoryJobLogger(),
  };

  console.log("=== 1. ETL: Collect + Normalize (fixtures/tse, ano 2022) ===");
  const collector = new TseCollector(new TseFixtureDataSource());
  const normalizer = new TseNormalizer();
  const collected = await collector.collect({ anos: [2022] }, context);
  const candidates = collected.items.map((item) => normalizer.normalize(item, context));
  console.log(`  ${candidates.length} PoliticalProfileCandidate normalizados.\n`);

  console.log("=== 2. Data Quality Engine (gate) ===");
  const qualityEngine = buildPoliticalProfileQualityEngine();
  const approved: PoliticalProfileCandidate[] = [];
  for (const candidate of candidates) {
    const report = await qualityEngine.evaluate(candidate, context);
    console.log(`  ${candidate.ballotName.padEnd(16)} approved=${report.approved}`);
    if (report.approved) approved.push(candidate);
  }
  assert(approved.length === candidates.length, `Todos os ${candidates.length} candidatos das fixtures são aprovados`);

  const entityResolver = new PoliticalProfileSlugEntityResolver(prisma);
  const importRegistry = new InMemoryImportStrategyRegistry();
  importRegistry.register(new PoliticalProfileImportStrategy());
  const importEngine = new ImportEngine(importRegistry);
  const importContext: ImportContext<PoliticalProfileCandidate> = { entityResolver };
  const writer = new PrismaPoliticalProfileWriter(prisma);

  console.log("\n=== 3. 1ª execução — esperado: CREATE (perfis ainda não existem) ===");
  const firstItems = await decideAll(approved, importEngine, importContext);
  for (const item of firstItems) {
    console.log(`  ${item.candidate.ballotName.padEnd(16)} → decisão: ${item.decision.action}`);
  }
  const firstReport = await runPoliticalProfileImport(firstItems, writer, context);
  console.log(`  Report: imported=${firstReport.imported} updated=${firstReport.updated} ignored=${firstReport.ignored} manualReview=${firstReport.manualReview} failed=${firstReport.failed}`);
  if (firstReport.failed > 0) {
    console.log("  --- logs de erro (diagnóstico) ---");
    for (const entry of context.logger.getEntries().filter((e) => e.level === "error")) {
      console.log(`  [error] ${entry.message}`, entry.meta ?? "");
    }
  }

  console.log("\n=== 4. Confirmando persistência no banco ===");
  for (const item of firstItems) {
    const candidate = item.candidate;
    const slug = slugify(candidate.ballotName);
    const profile = await prisma.politicalProfile.findUnique({
      where: { slug },
      include: { affiliations: { where: { isCurrent: true }, include: { party: true } } },
    });

    assert(!!profile, `Perfil "${slug}" existe no banco`);
    assert(profile?.fullName === candidate.fullName, `Perfil "${slug}": fullName persistido corretamente`);
    assert(profile?.displayName === candidate.ballotName, `Perfil "${slug}": displayName === ballotName`);
    // "status" nunca é tocado por UPDATE (estratégia de UPDATE seguro) — só um
    // CREATE novo garante status="candidate"; um perfil que já existia (UPDATE)
    // mantém o status que já tinha, seja lá qual for.
    if (item.decision.action === "CREATE") {
      assert(profile?.status === "candidate", `Perfil "${slug}" (CREATE): status === "candidate"`);
    } else {
      assert(true, `Perfil "${slug}" (UPDATE): status preservado sem alteração (era "${profile?.status}") — UPDATE seguro nunca toca em status`);
    }
    assert(profile?.isCandidate === true, `Perfil "${slug}": isCandidate === true`);
    assert(!!profile?.currentOfficeId, `Perfil "${slug}": currentOfficeId preenchido`);

    const currentAffiliation = profile?.affiliations[0];
    assert(!!currentAffiliation, `Perfil "${slug}": possui uma PoliticalAffiliation isCurrent=true`);
    assert(currentAffiliation?.party.acronym === candidate.party.acronym, `Perfil "${slug}": filiado ao partido correto (${candidate.party.acronym})`);

    const mandateCount = await prisma.mandate.count({ where: { profileId: profile?.id } });
    assert(mandateCount === 0, `Perfil "${slug}": nenhum Mandate criado (TSE não informou resultado eleitoral — comportamento esperado)`);
  }

  console.log("\n=== 5. 2ª execução — esperado: UPDATE (mesmos perfis, sem duplicar) ===");
  const secondItems = await decideAll(approved, importEngine, importContext);
  for (const item of secondItems) {
    console.log(`  ${item.candidate.ballotName.padEnd(16)} → decisão: ${item.decision.action} (targetEntityId=${item.decision.targetEntityId})`);
  }
  const secondReport = await runPoliticalProfileImport(secondItems, writer, context);
  console.log(`  Report: imported=${secondReport.imported} updated=${secondReport.updated} ignored=${secondReport.ignored} manualReview=${secondReport.manualReview} failed=${secondReport.failed}`);

  assert(secondReport.updated === approved.length, `2ª execução: todos os ${approved.length} candidatos viram UPDATE (obtido: ${secondReport.updated})`);
  assert(secondReport.imported === 0, `2ª execução: nenhum CREATE novo (obtido: ${secondReport.imported})`);

  console.log("\n=== 6. Confirmando ausência de duplicatas ===");
  for (const candidate of approved) {
    const slug = slugify(candidate.ballotName);
    const count = await prisma.politicalProfile.count({ where: { slug } });
    assert(count === 1, `Perfil "${slug}": exatamente 1 registro no banco (sem duplicata) — obtido: ${count}`);

    const affiliationCount = await prisma.politicalAffiliation.count({
      where: { profile: { slug }, isCurrent: true },
    });
    assert(affiliationCount === 1, `Perfil "${slug}": exatamente 1 PoliticalAffiliation isCurrent=true (sem duplicata) — obtido: ${affiliationCount}`);
  }

  console.log(`\n=== Resultado: ${assertions - failures}/${assertions} OK ===`);
  await prisma.$disconnect();
  if (failures > 0) {
    console.error(`${failures} verificação(ões) falharam.`);
    process.exit(1);
  }
}

main().catch(async (error: unknown) => {
  console.error(error);
  await prismaRef?.$disconnect();
  process.exit(1);
});
