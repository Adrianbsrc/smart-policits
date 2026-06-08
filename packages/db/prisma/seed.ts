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

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"]! });
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const ALL_SEEDS = [...GOVERNORS_SEED, ...PRESIDENTS_SEED];

const PARTY_META: Record<string, { name: string; colorHex: string; ideology: string }> = {
  PT:           { name: "Partido dos Trabalhadores",                   colorHex: "#CC0000", ideology: "left" },
  PL:           { name: "Partido Liberal",                             colorHex: "#003580", ideology: "right" },
  "UNIÃO":      { name: "União Brasil",                                colorHex: "#002868", ideology: "center_right" },
  MDB:          { name: "Movimento Democrático Brasileiro",            colorHex: "#0D6EFD", ideology: "center" },
  PP:           { name: "Progressistas",                               colorHex: "#005EA6", ideology: "center_right" },
  PSD:          { name: "Partido Social Democrático",                  colorHex: "#009C3B", ideology: "center" },
  PSDB:         { name: "Partido da Social Democracia Brasileira",     colorHex: "#006DB3", ideology: "center_right" },
  PSB:          { name: "Partido Socialista Brasileiro",               colorHex: "#E8003D", ideology: "center_left" },
  PDT:          { name: "Partido Democrático Trabalhista",             colorHex: "#006D77", ideology: "left" },
  REPUBLICANOS: { name: "Republicanos",                               colorHex: "#0B6623", ideology: "center_right" },
  NOVO:         { name: "Partido Novo",                               colorHex: "#FF6600", ideology: "right" },
  PSOL:         { name: "Partido Socialismo e Liberdade",             colorHex: "#FFCC00", ideology: "far_left" },
  SOLIDARIEDADE:{ name: "Solidariedade",                              colorHex: "#00B0F0", ideology: "center_left" },
  PODE:         { name: "Podemos",                                    colorHex: "#FF4B00", ideology: "center" },
  AVANTE:       { name: "Avante",                                     colorHex: "#1A7EC8", ideology: "center_left" },
  REDE:         { name: "Rede Sustentabilidade",                      colorHex: "#00A859", ideology: "center_left" },
  PATRIOTA:     { name: "Patriota",                                   colorHex: "#006400", ideology: "right" },
  PCB:          { name: "Partido Comunista Brasileiro",               colorHex: "#8B0000", ideology: "far_left" },
  PCO:          { name: "Partido da Causa Operária",                  colorHex: "#B00000", ideology: "far_left" },
};

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

  console.log("\nSeed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
