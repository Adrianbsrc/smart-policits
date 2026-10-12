/**
 * Teste manual do fluxo completo:
 *
 *   TseCollector (fixtures/tse) → TseNormalizer → QualityEngine
 *     → (approved?) → ImportEngine → ImportDecision
 *
 * A configuração das regras (quais campos de PoliticalProfileCandidate cada
 * regra genérica deve olhar) vive AQUI, não em packages/etl/src/data-quality/
 * — prova de que as regras nunca conhecem o domínio, só recebem FieldRef.
 *
 * Usage:
 *   pnpm --filter @smart-politics/etl test:data-quality
 */
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
import type { QualityReport } from "../src/data-quality";
import {
  ImportEngine,
  InMemoryImportStrategyRegistry,
  PoliticalProfileImportStrategy,
  POLITICAL_PROFILE_CANDIDATE_TYPE,
} from "../src/import-engine";
import type { ImportCandidate } from "../src/import-engine";

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

/** Config específica de PoliticalProfileCandidate — fora de data-quality/, como deveria ser. */
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
    new EmptyTextRule<PoliticalProfileCandidate>([
      { label: "ballotName", get: (c) => c.ballotName },
      { label: "candidacyStatusLabel", get: (c) => c.candidacyStatusLabel },
    ]),
  );
  registry.register(new FutureDateRule<PoliticalProfileCandidate>([{ label: "collectedAt", get: (c) => c.collectedAt }]));
  registry.register(new BrokenSourceRule<PoliticalProfileCandidate>([{ label: "sourceUrl", get: (c) => c.sourceUrl }]));

  return new QualityEngine<PoliticalProfileCandidate>(registry);
}

function brokenCandidate(): PoliticalProfileCandidate {
  return {
    id: "tse:2022:BROKEN",
    externalId: "BROKEN",
    fullName: "",
    ballotName: "   ",
    party: { number: "PT13", acronym: "PT", name: "Partido dos Trabalhadores" },
    election: { year: 2022, office: "president", ballotNumber: "13" },
    candidacyStatus: "unknown",
    candidacyStatusLabel: "",
    totalAssetsBrl: -50,
    assets: [
      { description: "Casa", details: "", valueBrl: 100, category: "imovel", rawCategoryLabel: "Casa" },
      { description: "Casa", details: "", valueBrl: 100, category: "imovel", rawCategoryLabel: "Casa" },
    ],
    sourceId: "tse",
    sourceUrl: "não-é-uma-url",
    sourceReliability: "official",
    collectedAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 ano no futuro
    knownMandate: null,
  };
}

async function main() {
  const context: JobContext = {
    jobId: "manual-test-data-quality",
    sourceId: "tse",
    startedAt: new Date(),
    logger: new InMemoryJobLogger(),
  };

  console.log("=== 1. ETL: Collect + Normalize (fixtures/tse, ano 2022) ===");
  const collector = new TseCollector(new TseFixtureDataSource());
  const normalizer = new TseNormalizer();
  const collected = await collector.collect({ anos: [2022] }, context);
  const goodCandidates = collected.items.map((item) => normalizer.normalize(item, context));
  console.log(`  ${goodCandidates.length} PoliticalProfileCandidate normalizados a partir das fixtures.\n`);

  const qualityEngine = buildPoliticalProfileQualityEngine();

  console.log("=== 2. QualityEngine — candidatos reais das fixtures (esperado: approved=true) ===");
  const goodReports: QualityReport[] = [];
  for (const candidate of goodCandidates) {
    const report = await qualityEngine.evaluate(candidate, context);
    goodReports.push(report);
    console.log(
      `  ${candidate.ballotName.padEnd(16)} score=${report.score.toString().padStart(3)} approved=${report.approved} errors=${report.errors.length} warnings=${report.warnings.length}`,
    );
    assert(report.approved, `${candidate.ballotName}: aprovado (dado real das fixtures não deveria falhar)`);
    assert(report.score === 100, `${candidate.ballotName}: score 100 (obtido: ${report.score})`);
  }

  console.log("\n=== 3. QualityEngine — candidato deliberadamente quebrado (esperado: approved=false) ===");
  const bad = brokenCandidate();
  const badReport = await qualityEngine.evaluate(bad, context);
  console.log(`  score=${badReport.score} approved=${badReport.approved}`);
  console.log(`  errors: ${badReport.errors.map((e) => e.code).join(", ")}`);
  console.log(`  warnings: ${badReport.warnings.map((w) => w.code).join(", ")}`);

  assert(!badReport.approved, "Candidato quebrado: approved=false");
  assert(badReport.errors.some((e) => e.code === "required-field-missing" && e.field === "fullName"), "RequiredFieldsRule pegou fullName vazio");
  assert(badReport.warnings.some((w) => w.code === "duplicate-items" && w.field === "assets"), "DuplicateFieldsRule pegou 'Casa' duplicada em assets");
  assert(badReport.errors.some((e) => e.code === "invalid-value" && e.field === "party.number"), "InvalidValueRule pegou party.number não-numérico ('PT13')");
  assert(badReport.errors.some((e) => e.code === "invalid-value" && e.field === "totalAssetsBrl"), "InvalidValueRule pegou totalAssetsBrl negativo");
  assert(badReport.warnings.some((w) => w.code === "empty-text" && w.field === "ballotName"), "EmptyTextRule pegou ballotName só com espaços");
  assert(badReport.errors.some((e) => e.code === "future-date" && e.field === "collectedAt"), "FutureDateRule pegou collectedAt no futuro");
  assert(badReport.errors.some((e) => e.code === "broken-source" && e.field === "sourceUrl"), "BrokenSourceRule pegou sourceUrl malformada");

  console.log("\n=== 4. Gate: só quem tem approved=true chega ao Import Engine ===");
  const importRegistry = new InMemoryImportStrategyRegistry();
  importRegistry.register(new PoliticalProfileImportStrategy());
  const importEngine = new ImportEngine(importRegistry);

  const allCandidates = [...goodCandidates, bad];
  const allReports = [...goodReports, badReport];

  let sentToImport = 0;
  let blockedByQuality = 0;

  for (let i = 0; i < allCandidates.length; i++) {
    const candidate = allCandidates[i]!;
    const report = allReports[i]!;

    if (!report.approved) {
      blockedByQuality++;
      console.log(`  ${candidate.ballotName.padEnd(16) || "(sem nome)"} → BLOQUEADO pelo Data Quality Engine (${report.errors.length} erro(s))`);
      continue;
    }

    const importCandidate: ImportCandidate<PoliticalProfileCandidate> = {
      type: POLITICAL_PROFILE_CANDIDATE_TYPE,
      sourceId: candidate.sourceId,
      collectedAt: candidate.collectedAt,
      payload: candidate,
    };
    const decision = await importEngine.decide(importCandidate);
    sentToImport++;
    console.log(`  ${candidate.ballotName.padEnd(16)} → Import Engine: ${decision.action}`);
  }

  assert(sentToImport === goodCandidates.length, `${goodCandidates.length} candidatos aprovados chegaram ao Import Engine (obtido: ${sentToImport})`);
  assert(blockedByQuality === 1, `1 candidato bloqueado pelo Data Quality Engine (obtido: ${blockedByQuality})`);

  console.log(`\n=== Resultado: ${assertions - failures}/${assertions} OK ===`);
  if (failures > 0) {
    console.error(`${failures} verificação(ões) falharam.`);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
