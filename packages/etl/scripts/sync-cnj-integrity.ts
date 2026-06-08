/**
 * Enriquece dados de integridade via CNJ Datajud (API pública).
 *
 * Busca processos criminais de deputados e senadores no CNJ,
 * armazena como PoliticianFact e recalcula integrityMultiplier.
 *
 * NOTA: busca por nome tem risco de falsos positivos (homônimos).
 * O cliente filtra por tipo de parte (réu/investigado).
 * Caps conservadores são aplicados: max 3 condenações, 5 processos ativos.
 *
 * Usage:
 *   pnpm --filter @smart-politics/etl sync:cnj-integrity
 *   pnpm --filter @smart-politics/etl sync:cnj-integrity -- --limit=100
 *
 * Variáveis de ambiente:
 *   DATABASE_URL  (obrigatório)
 *   CNJ_API_KEY   (opcional — aumenta o rate limit do CNJ)
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../.env") });
dotenv.config();

import { PrismaPg }   from "@prisma/adapter-pg";
import { PrismaClient } from "@smart-politics/db";
import { SCORE_VERSION } from "@smart-politics/scoring";
import { fetchCnjProfile, cnjProfileToIntegrityFields } from "../src/sources/cnj";

// ─── arg parsing ─────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT   = limitArg ? parseInt(limitArg.split("=")[1]!, 10) : 50;
const CNJ_KEY = process.env["CNJ_API_KEY"];

// ─── Cálculo do multiplicador de integridade (subconjunto do scoring engine) ─
function calcMultiplier(fields: {
  criminalConvictions: number;
  criminalCharges:     number;
  mpChargesAccepted:   number;
}): { multiplier: number; penalties: { reason: string; penalty: number; source: string }[] } {
  const penalties: { reason: string; penalty: number; source: string }[] = [];
  let total = 0;

  const add = (n: number, per: number, reason: string, src: string, cap: number) => {
    if (n <= 0) return;
    const p = Math.min(per * n, cap);
    total += p;
    penalties.push({ reason, penalty: Math.round(p * 100) / 100, source: src });
  };

  add(fields.criminalConvictions, 0.50, "Condenação criminal transitada em julgado (CNJ)",  "CNJ Datajud / STF / TJ estaduais", 0.60);
  add(fields.criminalCharges,     0.20, "Réu em processo criminal ativo (CNJ)",               "CNJ Datajud",                      0.40);
  add(fields.mpChargesAccepted,   0.10, "Denúncia aceita pelo Ministério Público (CNJ)",       "CNJ Datajud / MP",                 0.20);

  const multiplier = Math.round(Math.max(0.3, Math.min(1.0, 1.0 - total)) * 100) / 100;
  return { multiplier, penalties };
}

async function main() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL não definida");

  const adapter = new PrismaPg({ connectionString: url });
  const prisma  = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  const p = prisma as never as {
    politician: {
      findMany: (a: unknown) => Promise<{ id: string; name: string }[]>;
    };
    score: {
      findUnique:  (a: unknown) => Promise<{ overall: number } | null>;
      update:      (a: unknown) => Promise<unknown>;
    };
    politicianFact: {
      findFirst: (a: unknown) => Promise<{ id: string } | null>;
      create:    (a: unknown) => Promise<unknown>;
    };
  };

  console.log(`\n=== CNJ Integrity Sync (limit=${LIMIT}) ===`);
  if (!CNJ_KEY) console.log("  (sem CNJ_API_KEY — usando API pública com rate limit reduzido)\n");

  const politicians = await p.politician.findMany({
    where: {
      score: { scoreType: { in: ["partial", "mock"] } },
      office: { in: ["federal_deputy", "senator"] },
    } as never,
    select: { id: true, name: true } as never,
    take:   Math.min(LIMIT, 200),
    orderBy: { updatedAt: "asc" } as never,
  });

  console.log(`  Políticos a processar: ${politicians.length}\n`);

  let processed = 0;
  let enriched  = 0;
  let errors    = 0;

  try {
    for (const pol of politicians) {
      process.stdout.write(`  [${processed + 1}/${politicians.length}] ${pol.name.padEnd(40)}`);

      try {
        const profile = await fetchCnjProfile(pol.name, undefined, CNJ_KEY);

        if (profile.totalProcessos === 0) {
          process.stdout.write("sem processos\n");
          processed++;
          await new Promise((r) => setTimeout(r, 250));
          continue;
        }

        // Salva processos como PoliticianFact
        for (const proc of profile.processos) {
          const numProc = proc.numeroProcesso ?? "sem-número";
          const existing = await p.politicianFact.findFirst({
            where: {
              politicianId: pol.id,
              type: "court_case",
              source: { contains: numProc },
            } as never,
            select: { id: true } as never,
          });

          if (!existing) {
            await p.politicianFact.create({
              data: {
                politicianId: pol.id,
                type:         "court_case",
                title:        `${proc.classeProcessual?.nome ?? "Processo"} — ${proc.tribunal ?? "CNJ"}`,
                description:  `Processo ${numProc} no ${proc.tribunal ?? "CNJ"}. Fonte: CNJ Datajud.`,
                source:       `CNJ Datajud — ${numProc}`,
                sourceUrl:    "https://api-publica.datajud.cnj.jus.br/",
                date:         proc.dataAjuizamento ? new Date(proc.dataAjuizamento) : null,
                verifiedAt:   new Date(),
                verifiedBy:   "cnj-datajud-api",
                sentiment:    -1,
                impact:       5,
                tags:         ["cnj", "processo-judicial"],
              } as never,
            });
          }
        }

        // Recalcula multiplier
        const cnjFields = cnjProfileToIntegrityFields(profile);
        const { multiplier, penalties } = calcMultiplier(cnjFields);

        const currentScore = await p.score.findUnique({
          where:  { politicianId: pol.id } as never,
          select: { overall: true } as never,
        });

        if (currentScore && multiplier < 1.0) {
          // Estima baseScore e recalcula overall
          const baseScore = Math.min(10, currentScore.overall / Math.max(0.3, multiplier));
          const newOverall = Math.round(Math.min(10, baseScore * multiplier) * 10) / 10;

          await p.score.update({
            where: { politicianId: pol.id } as never,
            data:  {
              integrityMultiplier: multiplier,
              overall:             newOverall,
              penalties:           penalties as never,
              scoreType:           "partial",
              scoreVersion:        SCORE_VERSION,
            } as never,
          });

          process.stdout.write(
            `ativos=${profile.criminaisAtivos} encerr=${profile.criminaisEncerrados} multiplier=${multiplier} → score=${newOverall}\n`,
          );
        } else {
          process.stdout.write(`${profile.totalProcessos} processos (multiplier já ajustado)\n`);
        }

        enriched++;
        processed++;
        await new Promise((r) => setTimeout(r, 250));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        process.stdout.write(`ERRO: ${msg.slice(0, 60)}\n`);
        errors++;
        processed++;
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n=== Resultado ===`);
  console.log(`  Processados:  ${processed}`);
  console.log(`  Enriquecidos: ${enriched}`);
  console.log(`  Erros:        ${errors}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
