/**
 * Prisma seed — dados estáticos iniciais.
 *
 * Usado para ambientes novos (CI, staging, local após reset).
 * Para sincronizar dados reais de APIs (deputados, senadores),
 * use POST /api/etl/sync/* após iniciar a aplicação.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { SCORE_VERSION } from "../../scoring/index";
import { GOVERNORS_SEED, PRESIDENTS_SEED } from "../../etl/src/seeds/politicians";
import { PARTY_META, slugify } from "./seed-shared";
import { seedPoliticalProfiles } from "./seed-political-profiles";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"]! });
const prisma = new PrismaClient({ adapter });

const ALL_SEEDS = [...GOVERNORS_SEED, ...PRESIDENTS_SEED];

async function main() {
  console.log("Seeding database...");

  // Upsert parties
  const partyMap = new Map<string, string>();
  const partySiglas = [...new Set(ALL_SEEDS.map((s) => s.party))];

  for (const sigla of partySiglas) {
    const meta = PARTY_META[sigla] ?? { name: sigla, colorHex: "#666666", ideology: "center" };
    const party = await prisma.party.upsert({
      where:  { acronym: sigla },
      update: { name: meta.name, colorHex: meta.colorHex },
      create: { acronym: sigla, name: meta.name, colorHex: meta.colorHex, ideology: meta.ideology as never },
    });
    partyMap.set(sigla, party.id);
    console.log(`  Party: ${sigla}`);
  }

  // Upsert politicians + scores
  for (const s of ALL_SEEDS) {
    const partyId = partyMap.get(s.party);
    if (!partyId) {
      console.warn(`  Party not found: ${s.party} — skipping ${s.name}`);
      continue;
    }

    const slug = slugify(s.name);
    const statusValue = (s.status ?? (s.office === "president" && !s.isPreCandidate ? "former" : "in_mandate")) as never;

    const updatePayload = {
      name:                 s.name,
      state:                s.state ?? null,
      partyId,
      status:               statusValue,
      isPreCandidate:       s.isPreCandidate ?? false,
      candidateYear:        s.candidateYear ?? null,
      candidateNumber:      s.candidateNumber ?? null,
      fichaLimpaIneligible: s.fichaLimpaIneligible ?? false,
      dataSource:           "manual" as const,
      ...(s.bio      ? { bio:      s.bio }      : {}),
      ...(s.photoUrl ? { photoUrl: s.photoUrl } : {}),
    };

    // Try upsert by tseId first; if slug conflict occurs, find by slug and update
    let politician = await prisma.politician.findUnique({ where: { tseId: s.tseId } });
    if (politician) {
      politician = await prisma.politician.update({ where: { id: politician.id }, data: updatePayload });
    } else {
      const bySlug = await prisma.politician.findUnique({ where: { slug } });
      if (bySlug) {
        politician = await prisma.politician.update({
          where: { id: bySlug.id },
          data: { isPreCandidate: s.isPreCandidate ?? false, candidateYear: s.candidateYear ?? null, status: statusValue,
            ...(s.bio ? { bio: s.bio } : {}), ...(s.photoUrl ? { photoUrl: s.photoUrl } : {}) },
        });
        console.log(`  Merged seed "${s.name}" into existing politician (slug: ${slug})`);
      } else {
        politician = await prisma.politician.create({
          data: { tseId: s.tseId, slug, office: s.office, ...updatePayload },
        });
      }
    }

    const zeroScore = {
      overall: 0,
      education: 0, health: 0, security: 0, economy: 0, environment: 0,
      infrastructure: 0, technology: 0, agriculture: 0, international: 0,
      culture: 0, socialRights: 0, entrepreneurship: 0,
      transparency: 0, constitutional: 0, fiscal: 0, activity: 0,
      integrityMultiplier: s.fichaLimpaIneligible ? 0.3 : 1.0,
      penalties: [] as never,
      scoreVersion: SCORE_VERSION,
      scoreType: "mock" as never,
    };

    await prisma.score.upsert({
      where:  { politicianId: politician.id },
      update: zeroScore,
      create: { politicianId: politician.id, ...zeroScore },
    });

    console.log(`  ${s.office === "president" ? "Presidente" : "Governador"}: ${s.name} (${s.party})`);
  }

  await seedPoliticalProfiles(prisma);

  console.log("\nSeed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
