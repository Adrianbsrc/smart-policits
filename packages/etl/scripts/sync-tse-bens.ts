/**
 * Busca declarações de bens do TSE para presidentes e governadores.
 *
 * Fonte: TSE DivulgaCandContas — API pública, sem autenticação.
 * URL: https://divulgacandcontas.tse.jus.br/divulga/#/
 *
 * Usage:
 *   pnpm --filter @smart-politics/etl sync:tse-bens
 *   pnpm --filter @smart-politics/etl sync:tse-bens -- --ano=2018
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../.env") });
dotenv.config();

import { PrismaPg }   from "@prisma/adapter-pg";
import { PrismaClient } from "@smart-politics/db";
import {
  fetchAllPresidentialBens,
  fetchGovernorBens,
  parseTseValue,
  normalizeTipoAtivo,
} from "../src/sources/tse";
import { GOVERNORS_SEED } from "../src/seeds/politicians";

// ─── arg parsing ─────────────────────────────────────────────────────────────
const args   = process.argv.slice(2);
const anoArg = args.find((a) => a.startsWith("--ano="));
const ANO    = anoArg ? parseInt(anoArg.split("=")[1]!, 10) : 2022;

async function main() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL não definida");

  const adapter = new PrismaPg({ connectionString: url });
  const prisma  = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  const p = prisma as never as {
    politician: { findFirst: (a: unknown) => Promise<{ id: string; name: string } | null> };
    assetDeclaration: { upsert: (a: unknown) => Promise<unknown> };
  };

  console.log(`\n=== TSE Bens — Eleição ${ANO} ===\n`);
  let created = 0;
  const errors: string[] = [];

  try {
    // ── Presidentes ──────────────────────────────────────────────────────────
    console.log("Presidentes...");
    try {
      const presidentBens = await fetchAllPresidentialBens(ANO);
      console.log(`  ${presidentBens.size} candidatos à presidência encontrados`);

      for (const [, { candidato, bens, totalBrl }] of presidentBens) {
        const name      = candidato.nomeUrna || candidato.nome;
        const partySigla = candidato.partido.sigla;

        const politician = await p.politician.findFirst({
          where: {
            office: "president",
            party:  { acronym: partySigla },
            name:   { contains: name.split(" ")[0], mode: "insensitive" },
          } as never,
          select: { id: true, name: true } as never,
        });

        if (!politician) {
          console.log(`  ⚠  Sem match: ${name} (${partySigla})`);
          continue;
        }

        const assetsJson = bens.map((b) => ({
          description: b.descricaoDeBem,
          details:     b.detalhesDoBem,
          valueBrl:    parseTseValue(b.valor),
          assetType:   normalizeTipoAtivo(b.tipoDeBem?.descricao ?? ""),
          tseType:     b.tipoDeBem?.descricao ?? "",
        }));

        await p.assetDeclaration.upsert({
          where:  { politicianId_year: { politicianId: politician.id, year: ANO } } as never,
          update: {
            totalValueBrl: totalBrl || assetsJson.reduce((s, a) => s + a.valueBrl, 0),
            assets:        assetsJson as never,
            sourceLabel:   `TSE DivulgaCandContas ${ANO}`,
            declarationUrl: `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/${ANO}/BR/1/${candidato.id}/bens`,
          } as never,
          create: {
            politicianId:  politician.id,
            year:          ANO,
            totalValueBrl: totalBrl || assetsJson.reduce((s, a) => s + a.valueBrl, 0),
            assets:        assetsJson as never,
            sourceLabel:   `TSE DivulgaCandContas ${ANO}`,
            declarationUrl: `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/${ANO}/BR/1/${candidato.id}/bens`,
          } as never,
        });

        console.log(`  ✓  ${politician.name.padEnd(35)} R$ ${(totalBrl / 1_000_000).toFixed(2)}M`);
        created++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ERRO presidentes: ${msg}`);
      errors.push(`presidentes: ${msg}`);
    }

    // ── Governadores ─────────────────────────────────────────────────────────
    console.log("\nGovernadores...");
    const govStates = [...new Set(GOVERNORS_SEED.map((g) => g.state!).filter(Boolean))];

    for (const uf of govStates) {
      try {
        const govBens = await fetchGovernorBens(ANO, uf);
        if (govBens.size === 0) continue;

        for (const [, { candidato, bens, totalBrl }] of govBens) {
          const name       = candidato.nomeUrna || candidato.nome;
          const partySigla = candidato.partido.sigla;

          const politician = await p.politician.findFirst({
            where: {
              office: "governor",
              state:  uf,
              party:  { acronym: partySigla },
              name:   { contains: name.split(" ")[0], mode: "insensitive" },
            } as never,
            select: { id: true, name: true } as never,
          });

          if (!politician) continue;

          const assetsJson = bens.map((b) => ({
            description: b.descricaoDeBem,
            details:     b.detalhesDoBem,
            valueBrl:    parseTseValue(b.valor),
            assetType:   normalizeTipoAtivo(b.tipoDeBem?.descricao ?? ""),
            tseType:     b.tipoDeBem?.descricao ?? "",
          }));

          await p.assetDeclaration.upsert({
            where:  { politicianId_year: { politicianId: politician.id, year: ANO } } as never,
            update: {
              totalValueBrl: totalBrl || assetsJson.reduce((s, a) => s + a.valueBrl, 0),
              assets:        assetsJson as never,
              sourceLabel:   `TSE DivulgaCandContas ${ANO}`,
            } as never,
            create: {
              politicianId:  politician.id,
              year:          ANO,
              totalValueBrl: totalBrl || assetsJson.reduce((s, a) => s + a.valueBrl, 0),
              assets:        assetsJson as never,
              sourceLabel:   `TSE DivulgaCandContas ${ANO}`,
            } as never,
          });

          console.log(`  ✓  [${uf}] ${politician.name.padEnd(35)} R$ ${(totalBrl / 1_000_000).toFixed(2)}M`);
          created++;
        }

        await new Promise((r) => setTimeout(r, 500)); // pausa entre estados
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  ERRO ${uf}: ${msg}`);
        errors.push(`${uf}: ${msg}`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n=== Resultado ===`);
  console.log(`  Declarações salvas: ${created}`);
  if (errors.length > 0) console.log(`  Erros: ${errors.join(" | ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
