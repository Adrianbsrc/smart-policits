import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../../../.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@smart-politics/db";

async function main() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL não definida");
  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
  const p = prisma as never as {
    politician: { findMany: (a: unknown) => Promise<{ name: string; office: string; score: { overall: number; integrityMultiplier: number; scoreType: string } | null }[]> };
  };

  const presidents = await p.politician.findMany({
    where: { office: "president" } as never,
    select: { name: true, office: true, score: { select: { overall: true, integrityMultiplier: true, scoreType: true } } } as never,
    orderBy: { score: { overall: "desc" } } as never,
  });

  console.log(`\n=== Presidentes no banco (${presidents.length}) ===`);
  for (const pol of presidents) {
    const s = pol.score;
    const overall = s ? s.overall.toFixed(1) : "SEM SCORE";
    const integrity = s ? s.integrityMultiplier.toFixed(2) : "—";
    const type = s ? s.scoreType : "—";
    console.log(`  ${pol.name.padEnd(38)} overall=${overall}  integrity=${integrity}  type=${type}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
