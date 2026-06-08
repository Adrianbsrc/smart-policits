/**
 * Seed de scores curados para presidentes e governadores.
 *
 * Execução:
 *   pnpm --filter @smart-politics/db db:seed:scores
 *
 * Aplica calculateScore() com inputs baseados em fontes públicas verificáveis.
 * scoreType = "partial" — diferencia de "mock" (zero) e "real" (API estruturada).
 *
 * Idempotente: pode ser reexecutado quantas vezes necessário.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { calculateScore, SCORE_VERSION } from "../../scoring/index";
import { CURATED_SCORE_INPUTS } from "../../etl/src/seeds/score-inputs";
import type { Prisma } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"]! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Applying curated scores...\n");

  let applied = 0;
  const notFound: string[] = [];

  for (const entry of CURATED_SCORE_INPUTS) {
    const politician = await prisma.politician.findFirst({
      where: { OR: [{ tseId: entry.tseId }, { name: entry.name }] },
      select: { id: true, name: true },
    });

    if (!politician) {
      console.warn(`  NOT FOUND: ${entry.name} (${entry.tseId})`);
      notFound.push(entry.name);
      continue;
    }

    const result = calculateScore(entry.input);

    const scoreData = {
      overall:             result.overall,
      education:           result.education,
      health:              result.health,
      security:            result.security,
      economy:             result.economy,
      environment:         result.environment,
      infrastructure:      result.infrastructure,
      technology:          result.technology,
      agriculture:         result.agriculture,
      international:       result.international,
      culture:             result.culture,
      socialRights:        result.socialRights,
      entrepreneurship:    result.entrepreneurship,
      transparency:        result.transparency,
      constitutional:      result.constitutional,
      fiscal:              result.fiscal,
      activity:            result.activity,
      integrityMultiplier: result.integrityMultiplier,
      penalties:           result.penalties as unknown as Prisma.InputJsonValue,
      scoreVersion:        SCORE_VERSION,
      scoreType:           "partial" as never,
    };

    await prisma.score.upsert({
      where:  { politicianId: politician.id },
      update: scoreData,
      create: { politicianId: politician.id, ...scoreData },
    });

    // Snapshot de histórico
    const last = await prisma.scoreHistory.findFirst({
      where: { politicianId: politician.id },
      orderBy: { snapshotAt: "desc" },
      select: { overall: true },
    });

    if (!last || Math.abs(last.overall - result.overall) > 0.05) {
      await prisma.scoreHistory.create({
        data: {
          politicianId:        politician.id,
          overall:             result.overall,
          education:           result.education,
          health:              result.health,
          security:            result.security,
          economy:             result.economy,
          environment:         result.environment,
          infrastructure:      result.infrastructure,
          technology:          result.technology,
          agriculture:         result.agriculture,
          international:       result.international,
          culture:             result.culture,
          socialRights:        result.socialRights,
          entrepreneurship:    result.entrepreneurship,
          transparency:        result.transparency,
          constitutional:      result.constitutional,
          fiscal:              result.fiscal,
          activity:            result.activity,
          integrityMultiplier: result.integrityMultiplier,
          scoreVersion:        SCORE_VERSION,
          scoreType:           "partial" as never,
          trigger:             "curated_seed",
        },
      });
    }

    const breakdown = result.breakdown;
    console.log(
      `  ✓ ${politician.name.padEnd(35)} overall=${result.overall.toFixed(1)}` +
      `  integrity=${result.integrityMultiplier.toFixed(2)}x` +
      `  transp=${result.transparency.toFixed(1)}` +
      `  activity=${result.activity.toFixed(1)}` +
      `  fiscal=${result.fiscal.toFixed(1)}` +
      `  const=${result.constitutional.toFixed(1)}`,
    );
    void breakdown;
    applied++;
  }

  console.log(`\n✓ Applied: ${applied}`);
  if (notFound.length) {
    console.warn(`✗ Not found in DB (${notFound.length}): ${notFound.join(", ")}`);
    console.warn("  → Run `pnpm db:seed` first to insert politicians.");
  }
  console.log("\nDone.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => void prisma.$disconnect());
