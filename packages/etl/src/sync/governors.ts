import type { PrismaClient } from "@smart-politics/db";
import { SCORE_VERSION } from "@smart-politics/scoring";
import { normalizeParty } from "../normalize/camara";
import { GOVERNORS_SEED, PRESIDENTS_SEED } from "../seeds/politicians";
import type { SeedPolitician } from "../seeds/politicians";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const ZERO_SCORE = {
  overall: 0,
  education: 0, health: 0, security: 0, economy: 0, environment: 0,
  infrastructure: 0, technology: 0, agriculture: 0, international: 0,
  culture: 0, socialRights: 0, entrepreneurship: 0,
  transparency: 0, constitutional: 0, fiscal: 0, activity: 0,
  integrityMultiplier: 1.0,
  penalties: [] as unknown as never,
  scoreVersion: SCORE_VERSION,
  scoreType: "mock" as never,
};

async function upsertSeedPolitician(
  prisma: { politician: Record<string, unknown>; score: Record<string, unknown> },
  seed: SeedPolitician,
  partyId: string,
): Promise<void> {
  const slug = slugify(seed.name);
  const updatePayload = {
    name: seed.name,
    state: seed.state ?? null,
    partyId,
    isPreCandidate: seed.isPreCandidate ?? false,
    candidateYear: seed.candidateYear ?? null,
    candidateNumber: seed.candidateNumber ?? null,
    fichaLimpaIneligible: seed.fichaLimpaIneligible ?? false,
    dataSource: "manual",
    ...(seed.bio ? { bio: seed.bio } : {}),
    ...(seed.photoUrl ? { photoUrl: seed.photoUrl } : {}),
  };

  const findUnique = prisma.politician["findUnique"] as (args: unknown) => Promise<{ id: string } | null>;
  const update = prisma.politician["update"] as (args: unknown) => Promise<{ id: string }>;
  const create = prisma.politician["create"] as (args: unknown) => Promise<{ id: string }>;

  let politician = await findUnique({ where: { tseId: seed.tseId } });

  if (politician) {
    politician = await update({ where: { id: politician.id }, data: updatePayload });
  } else {
    const bySlug = await findUnique({ where: { slug } });
    if (bySlug) {
      politician = await update({
        where: { id: bySlug.id },
        data: {
          isPreCandidate: seed.isPreCandidate ?? false,
          candidateYear: seed.candidateYear ?? null,
          fichaLimpaIneligible: seed.fichaLimpaIneligible ?? false,
          ...(seed.bio ? { bio: seed.bio } : {}),
          ...(seed.photoUrl ? { photoUrl: seed.photoUrl } : {}),
        },
      });
      console.log(`  Merged "${seed.name}" → político existente (${(bySlug as { tseId?: string }).tseId})`);
    } else {
      try {
        politician = await create({
          data: { tseId: seed.tseId, slug, office: seed.office, ...updatePayload },
        });
      } catch (err: unknown) {
        const pe = err as { code?: string };
        if (pe.code !== "P2002") throw err;
        politician = (await findUnique({ where: { tseId: seed.tseId } }))
          ?? (await findUnique({ where: { slug } }));
        if (!politician) throw err;
        politician = await update({ where: { id: politician.id }, data: updatePayload });
      }
    }
  }

  const zeroScore = {
    ...ZERO_SCORE,
    ...(seed.fichaLimpaIneligible ? { integrityMultiplier: 0.3 } : {}),
  };

  // Só cria o score se ainda não existe — nunca sobrescreve score real com zeros.
  // Scores curados são aplicados depois pelo sync:curated-scores.
  const scoreCreate    = prisma.score["create"]     as (args: unknown) => Promise<unknown>;
  const scoreFindUnique = prisma.score["findUnique"] as (args: unknown) => Promise<{ overall: number } | null>;

  const existingScore = await scoreFindUnique({
    where:  { politicianId: politician.id } as never,
    select: { overall: true } as never,
  });
  if (!existingScore) {
    await scoreCreate({ data: { politicianId: politician.id, ...zeroScore } });
  }
}

export async function syncGovernors(prisma: PrismaClient): Promise<{ synced: number; skipped: number }> {
  console.log("Sincronizando governadores (2023-2027)...");
  const p = prisma as never as { party: Record<string, unknown>; politician: Record<string, unknown>; score: Record<string, unknown> };

  const partySiglas = [...new Set(GOVERNORS_SEED.map((s) => s.party))];
  const partyMap = new Map<string, string>();
  for (const sigla of partySiglas) {
    const normalized = normalizeParty(sigla);
    const upsert = p.party["upsert"] as (args: unknown) => Promise<{ id: string }>;
    const party = await upsert({
      where: { acronym: sigla },
      update: { name: normalized.name, colorHex: normalized.colorHex, ideology: normalized.ideology },
      create: normalized,
    });
    partyMap.set(sigla, party.id);
  }

  let synced = 0;
  let skipped = 0;
  for (const seed of GOVERNORS_SEED) {
    const partyId = partyMap.get(seed.party);
    if (!partyId) { skipped++; continue; }
    await upsertSeedPolitician(p as never, seed, partyId);
    synced++;
  }
  console.log(`  Governadores: ${synced} sincronizados, ${skipped} ignorados.`);
  return { synced, skipped };
}

export async function syncPresidents(prisma: PrismaClient): Promise<{ synced: number; skipped: number }> {
  console.log("Sincronizando presidentes / pré-candidatos...");
  const p = prisma as never as { party: Record<string, unknown>; politician: Record<string, unknown>; score: Record<string, unknown> };

  const partySiglas = [...new Set(PRESIDENTS_SEED.map((s) => s.party))];
  const partyMap = new Map<string, string>();
  for (const sigla of partySiglas) {
    const normalized = normalizeParty(sigla);
    const upsert = p.party["upsert"] as (args: unknown) => Promise<{ id: string }>;
    const party = await upsert({
      where: { acronym: sigla },
      update: { name: normalized.name, colorHex: normalized.colorHex, ideology: normalized.ideology },
      create: normalized,
    });
    partyMap.set(sigla, party.id);
  }

  let synced = 0;
  let skipped = 0;
  for (const seed of PRESIDENTS_SEED) {
    const partyId = partyMap.get(seed.party);
    if (!partyId) { skipped++; continue; }
    await upsertSeedPolitician(p as never, seed, partyId);
    synced++;
  }
  console.log(`  Presidentes: ${synced} sincronizados, ${skipped} ignorados.`);
  return { synced, skipped };
}
