/**
 * Sync senators from Senado Federal API.
 *
 * Usage:
 *   pnpm --filter @smart-politics/etl sync:senado
 *
 * DATABASE_URL is loaded from the monorepo root .env.
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../.env") });
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@smart-politics/db";
import { syncSenadoSenadores } from "../src/sync/senado";

async function main() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL não definida");

  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  try {
    const result = await syncSenadoSenadores(prisma as never);
    console.log(`\nResultado: ${result.synced} sincronizados, ${result.skipped} ignorados`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
