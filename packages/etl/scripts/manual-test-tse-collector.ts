/**
 * Teste manual do TseCollector + TseNormalizer usando fixtures locais
 * (fixtures/tse/*.json) — sem chamar a API real do TSE, sem gravar no banco.
 *
 * Usage:
 *   pnpm --filter @smart-politics/etl test:tse-collector
 */
import { InMemoryJobLogger } from "../src/shared/job-logger";
import type { JobContext } from "../src/contracts/job.contract";
import { TseCollector } from "../src/collectors/tse/tse.collector";
import { TseFixtureDataSource } from "../src/collectors/tse/tse-fixture-data-source";
import { TseNormalizer } from "../src/normalizers/tse/tse.normalizer";
import type { PoliticalProfileCandidate } from "../src/domain/political-profile-candidate";

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

async function main() {
  const collector = new TseCollector(new TseFixtureDataSource());
  const normalizer = new TseNormalizer();

  const context: JobContext = {
    jobId: "manual-test-tse-collector",
    sourceId: "tse",
    startedAt: new Date(),
    logger: new InMemoryJobLogger(),
  };

  console.log("=== 1. Collect (fixtures/tse, ano 2022) ===");
  const collected = await collector.collect({ anos: [2022] }, context);
  console.log(`  Coletados ${collected.items.length} itens brutos.\n`);

  assert(collected.sourceId === "tse", "CollectResult.sourceId === 'tse'");
  assert(collected.items.length === 4, "4 candidatos coletados (Lula, Bolsonaro, Ciro, Tebet)");
  assert(
    collected.items.every((item) => item.ano === 2022),
    "Todo item coletado pertence ao ano solicitado (2022)",
  );

  console.log("\n=== 2. Normalize (TseRawCandidacy → PoliticalProfileCandidate) ===");
  const candidates: PoliticalProfileCandidate[] = collected.items.map((item) => normalizer.normalize(item, context));

  for (const candidate of candidates) {
    console.log(
      `  ${candidate.ballotName.padEnd(16)} ${candidate.party.acronym.padEnd(6)} #${candidate.election.ballotNumber.padEnd(4)}` +
        ` status=${candidate.candidacyStatus.padEnd(10)} bens=R$ ${candidate.totalAssetsBrl.toLocaleString("pt-BR")}`,
    );
  }

  console.log("\n=== 3. Verificações ===");
  const lula = candidates.find((c) => c.externalId === "F2022-001");
  const tebet = candidates.find((c) => c.externalId === "F2022-004");

  assert(candidates.length === 4, "4 PoliticalProfileCandidate normalizados");
  assert(!!lula, "Lula (F2022-001) presente no resultado normalizado");
  assert(lula?.party.acronym === "PT", "Partido de Lula normalizado corretamente (PT)");
  assert(lula?.election.year === 2022 && lula?.election.office === "president", "Eleição de Lula: 2022/president");
  assert(lula?.candidacyStatus === "eligible", "Situação 'APTO' normalizada para 'eligible'");
  assert(lula?.assets.length === 3, "Lula possui 3 bens normalizados a partir do fixture");
  assert(
    lula?.totalAssetsBrl === 1_200_000,
    `totalAssetsBrl de Lula é 1200000 (obtido: ${lula?.totalAssetsBrl})`,
  );
  assert(
    lula?.sourceUrl === "https://divulgacandcontas.tse.jus.br/divulga/#/candidato/2022/BR/1/F2022-001/bens",
    "sourceUrl aponta para a página de declaração de bens do TSE",
  );

  assert(!!tebet, "Simone Tebet (F2022-004, sem bens declarados) presente no resultado");
  assert(tebet?.assets.length === 0, "Tebet: lista de bens vazia (fixture sem bens)");
  assert(tebet?.totalAssetsBrl === 0, `Tebet: totalAssetsBrl é 0 quando não há bens (obtido: ${tebet?.totalAssetsBrl})`);

  assert(
    candidates.every((c) => c.sourceId === "tse" && c.sourceReliability === "official"),
    "Todo PoliticalProfileCandidate carrega sourceId='tse' e sourceReliability='official'",
  );
  assert(
    candidates.every((c) => c.id === `tse:2022:${c.externalId}`),
    "Todo id segue o padrão 'tse:{ano}:{externalId}'",
  );

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
