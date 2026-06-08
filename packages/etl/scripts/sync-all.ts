/**
 * Sync completo: governadores, presidentes, deputados federais, senadores.
 * Após o sync legislativo, aplica os scores curados para presidentes/governadores.
 *
 * Ordem de execução:
 *   1. Seeds (governadores + presidentes) — rápido, sem API externa
 *   2. Câmara + Senado em paralelo — lento (~20-40 min para todos)
 *   3. Scores curados (presidentes + governadores pré-candidatos) — rápido
 *
 * Para enriquecer com CNJ e TSE bens, rode separadamente:
 *   pnpm --filter @smart-politics/etl sync:cnj-integrity
 *   pnpm --filter @smart-politics/etl sync:tse-bens
 *
 * Usage:
 *   pnpm --filter @smart-politics/etl sync:all
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../.env") });
dotenv.config();

import { PrismaPg }   from "@prisma/adapter-pg";
import { PrismaClient } from "@smart-politics/db";
import { calculateScore, SCORE_VERSION } from "@smart-politics/scoring";
import { syncCamaraDeputados }  from "../src/sync/camara";
import { syncSenadoSenadores }  from "../src/sync/senado";
import { syncGovernors, syncPresidents } from "../src/sync/governors";
import { CURATED_SCORE_INPUTS } from "../src/seeds/score-inputs";

async function applyCuratedScores(
  p: {
    politician: { findFirst: (a: unknown) => Promise<{ id: string } | null> };
    score:      { upsert:    (a: unknown) => Promise<unknown> };
  },
): Promise<{ applied: number; notFound: string[] }> {
  let applied = 0;
  const notFound: string[] = [];

  for (const entry of CURATED_SCORE_INPUTS) {
    const politician = await p.politician.findFirst({
      where: { OR: [{ tseId: entry.tseId }, { name: entry.name }] } as never,
      select: { id: true } as never,
    });

    if (!politician) { notFound.push(entry.name); continue; }

    const result = calculateScore(entry.input);
    const scoreData = {
      overall: result.overall, education: result.education, health: result.health,
      security: result.security, economy: result.economy, environment: result.environment,
      infrastructure: result.infrastructure, technology: result.technology,
      agriculture: result.agriculture, international: result.international,
      culture: result.culture, socialRights: result.socialRights,
      entrepreneurship: result.entrepreneurship, transparency: result.transparency,
      constitutional: result.constitutional, fiscal: result.fiscal, activity: result.activity,
      integrityMultiplier: result.integrityMultiplier,
      penalties: result.penalties as unknown as never,
      breakdown: result.breakdown as unknown as never,
      scoreVersion: SCORE_VERSION, scoreType: "partial" as never,
    };

    await p.score.upsert({
      where:  { politicianId: politician.id } as never,
      update: scoreData as never,
      create: { politicianId: politician.id, ...scoreData } as never,
    });
    applied++;
    console.log(`    ${entry.name.padEnd(35)} → ${result.overall.toFixed(1)}`);
  }
  return { applied, notFound };
}

async function main() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL não definida");

  const adapter = new PrismaPg({ connectionString: url });
  const prisma  = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
  const p       = prisma as never;

  const start = Date.now();
  console.log("\n=== Smart Politics — ETL Sync All ===\n");

  try {
    // ── 1. Seeds (rápido) ─────────────────────────────────────────────────────
    const [govResult, presResult] = await Promise.all([
      syncGovernors(p),
      syncPresidents(p),
    ]);

    // ── 2. Legislativo (lento ~20-40min) ─────────────────────────────────────
    console.log("\nIniciando sync legislativo (Câmara + Senado em paralelo)...");
    console.log("  (pode levar 20-40 min para 513 deputados + 81 senadores)\n");
    const [camResult, senResult] = await Promise.all([
      syncCamaraDeputados(p),
      syncSenadoSenadores(p),
    ]);

    // ── 3. Scores curados (rápido) ────────────────────────────────────────────
    console.log("\nAplicando scores curados (presidentes + governadores)...");
    const curatedResult = await applyCuratedScores(p as never);

    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log("\n=== Resumo ===");
    console.log(`  Governadores:       ${govResult.synced} sync, ${govResult.skipped} skip`);
    console.log(`  Presidentes:        ${presResult.synced} sync, ${presResult.skipped} skip`);
    console.log(`  Deputados:          ${camResult.synced} sync, ${camResult.skipped} skip`);
    console.log(`  Senadores:          ${senResult.synced} sync, ${senResult.skipped} skip`);
    console.log(`  Scores curados:     ${curatedResult.applied} aplicados`);
    if (curatedResult.notFound.length > 0) {
      console.log(`  ⚠  Não encontrados: ${curatedResult.notFound.join(", ")}`);
    }
    console.log(`  Tempo total:        ${Math.floor(elapsed / 60)}min ${elapsed % 60}s`);
    console.log("\nPróximos passos (opcionais, em ordem):");
    console.log("  pnpm --filter @smart-politics/etl sync:tse-bens");
    console.log("  pnpm --filter @smart-politics/etl sync:cnj-integrity");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
