/**
 * Aplica scores curados (baseados em fontes públicas verificáveis) para
 * presidentes e governadores sem cobertura de API oficial.
 *
 * scoreType = "partial"
 * Idempotente: pode ser executado múltiplas vezes.
 *
 * Usage:
 *   pnpm --filter @smart-politics/etl sync:curated-scores
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../.env") });
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@smart-politics/db";
import { calculateScore, SCORE_VERSION } from "@smart-politics/scoring";
import { CURATED_SCORE_INPUTS } from "../src/seeds/score-inputs";

async function main() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL não definida");

  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  const p = prisma as never as {
    politician: {
      findFirst: (args: unknown) => Promise<{ id: string } | null>;
    };
    score: {
      upsert: (args: unknown) => Promise<unknown>;
    };
  };

  console.log(`\n=== Aplicando ${CURATED_SCORE_INPUTS.length} scores curados ===\n`);

  let applied = 0;
  const notFound: string[] = [];

  try {
    for (const entry of CURATED_SCORE_INPUTS) {
      const politician = await p.politician.findFirst({
        where: { OR: [{ tseId: entry.tseId }, { name: entry.name }] } as never,
        select: { id: true } as never,
      });

      if (!politician) {
        console.warn(`  ⚠  Não encontrado: ${entry.name} (tseId: ${entry.tseId})`);
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
        penalties:           result.penalties as unknown as never,
        scoreVersion:        SCORE_VERSION,
        scoreType:           "partial" as never,
        breakdown:           result.breakdown as unknown as never,
      };

      await p.score.upsert({
        where:  { politicianId: politician.id } as never,
        update: scoreData as never,
        create: { politicianId: politician.id, ...scoreData } as never,
      });

      console.log(`  ✓  ${entry.name.padEnd(35)} → ${result.overall.toFixed(1)} (integridade: ${result.integrityMultiplier.toFixed(2)})`);
      applied++;
    }

    console.log(`\n  Aplicados: ${applied}`);
    if (notFound.length > 0) {
      console.log(`  Não encontrados (rode sync:governors e sync:presidents primeiro): ${notFound.join(", ")}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
