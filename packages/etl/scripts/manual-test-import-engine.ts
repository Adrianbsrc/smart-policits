/**
 * Teste manual do fluxo completo ETL → Import Engine:
 *
 *   TseCollector (fixtures/tse) → TseNormalizer → ImportCandidate →
 *   ImportEngine → PoliticalProfileImportStrategy → ImportDecision
 *
 * Sem banco, sem EntityResolver real — por isso toda decisão hoje é
 * MANUAL_REVIEW (correto: sem forma de confirmar duplicidade, a strategy
 * nunca arrisca CREATE/UPDATE automático). Também simula um EntityResolver
 * "fake" só para provar que o mesmo código (zero alteração em
 * ImportEngine/PoliticalProfileImportStrategy) já sabe decidir CREATE/UPDATE
 * quando o colaborador existir de verdade.
 *
 * Usage:
 *   pnpm --filter @smart-politics/etl test:import-engine
 */
import { InMemoryJobLogger } from "../src/shared/job-logger";
import type { JobContext } from "../src/contracts/job.contract";
import { TseCollector } from "../src/collectors/tse/tse.collector";
import { TseFixtureDataSource } from "../src/collectors/tse/tse-fixture-data-source";
import { TseNormalizer } from "../src/normalizers/tse/tse.normalizer";
import type { PoliticalProfileCandidate } from "../src/domain/political-profile-candidate";
import {
  ImportEngine,
  InMemoryImportStrategyRegistry,
  PoliticalProfileImportStrategy,
  POLITICAL_PROFILE_CANDIDATE_TYPE,
} from "../src/import-engine";
import type { EntityMatch, EntityResolver, ImportCandidate, ImportContext } from "../src/import-engine";

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

/** Resolver fake — só para o teste provar o caminho "com EntityResolver". Não faz parte da arquitetura entregue. */
class FakeEntityResolver implements EntityResolver<PoliticalProfileCandidate> {
  async resolve(candidate: PoliticalProfileCandidate): Promise<EntityMatch[]> {
    if (candidate.party.acronym === "PT") {
      return [{ entityId: "profile-lula-existing", score: 0.95, matchedOn: ["fullName", "party.acronym"] }];
    }
    return [];
  }
}

async function main() {
  const context: JobContext = {
    jobId: "manual-test-import-engine",
    sourceId: "tse",
    startedAt: new Date(),
    logger: new InMemoryJobLogger(),
  };

  console.log("=== 1. ETL: Collect + Normalize (fixtures/tse, ano 2022) ===");
  const collector = new TseCollector(new TseFixtureDataSource());
  const normalizer = new TseNormalizer();
  const collected = await collector.collect({ anos: [2022] }, context);
  const profiles = collected.items.map((item) => normalizer.normalize(item, context));
  console.log(`  ${profiles.length} PoliticalProfileCandidate normalizados.\n`);

  console.log("=== 2. Envelopar como ImportCandidate ===");
  const candidates: ImportCandidate<PoliticalProfileCandidate>[] = profiles.map((profile) => ({
    type: POLITICAL_PROFILE_CANDIDATE_TYPE,
    sourceId: profile.sourceId,
    collectedAt: profile.collectedAt,
    payload: profile,
  }));

  console.log("=== 3. Import Engine — sem EntityResolver (estado real desta task) ===");
  const registry = new InMemoryImportStrategyRegistry();
  registry.register(new PoliticalProfileImportStrategy());
  const engine = new ImportEngine(registry);

  const emptyContext: ImportContext<PoliticalProfileCandidate> = {};
  for (const candidate of candidates) {
    const decision = await engine.decide(candidate, emptyContext);
    console.log(
      `  ${candidate.payload.ballotName.padEnd(16)} → ${decision.action.padEnd(14)} (confidence=${decision.confidence.toFixed(2)}) — ${decision.reason}`,
    );
    assert(decision.action === "MANUAL_REVIEW", `${candidate.payload.ballotName}: sem EntityResolver, decisão é MANUAL_REVIEW`);
    assert(
      decision.warnings.some((w) => w.code === "entity-resolver-unavailable"),
      `${candidate.payload.ballotName}: warning 'entity-resolver-unavailable' presente`,
    );
  }

  console.log("\n=== 4. Import Engine — com EntityResolver (prova da extensão futura) ===");
  const contextWithResolver: ImportContext<PoliticalProfileCandidate> = { entityResolver: new FakeEntityResolver() };

  const lulaCandidate = candidates.find((c) => c.payload.party.acronym === "PT");
  const bolsonaroCandidate = candidates.find((c) => c.payload.party.acronym === "PL");

  if (lulaCandidate) {
    const decision = await engine.decide(lulaCandidate, contextWithResolver);
    console.log(`  ${lulaCandidate.payload.ballotName.padEnd(16)} → ${decision.action} (confidence=${decision.confidence.toFixed(2)}) — ${decision.reason}`);
    assert(decision.action === "UPDATE", "Com EntityResolver + match forte (PT): decisão vira UPDATE");
    assert(decision.confidence === 0.95, `Confidence herdada do match (obtido: ${decision.confidence})`);
  }

  if (bolsonaroCandidate) {
    const decision = await engine.decide(bolsonaroCandidate, contextWithResolver);
    console.log(`  ${bolsonaroCandidate.payload.ballotName.padEnd(16)} → ${decision.action} (confidence=${decision.confidence.toFixed(2)}) — ${decision.reason}`);
    assert(decision.action === "CREATE", "Com EntityResolver + nenhum match (PL): decisão vira CREATE");
  }

  console.log("\n=== 5. Open/Closed: tipo desconhecido não quebra o ImportEngine ===");
  const unknownCandidate: ImportCandidate<{ x: number }> = {
    type: "tipo-nunca-registrado",
    sourceId: "unknown",
    collectedAt: new Date(),
    payload: { x: 1 },
  };
  const unknownDecision = await engine.decide(unknownCandidate);
  console.log(`  tipo desconhecido → ${unknownDecision.action} — ${unknownDecision.reason}`);
  assert(unknownDecision.action === "MANUAL_REVIEW", "Tipo sem strategy registrada: MANUAL_REVIEW, sem lançar exceção");

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
