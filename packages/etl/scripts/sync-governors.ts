/**
 * Sync governors (static seed data).
 *
 * Usage:
 *   pnpm --filter @smart-politics/etl sync:governors
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../.env") });
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@smart-politics/db";
import { syncGovernors } from "../src/sync/governors";

async function main() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL não definida");

  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  try {
    const result = await syncGovernors(prisma as never);
    console.log(`\nResultado: ${result.synced} sincronizados, ${result.skipped} ignorados`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
