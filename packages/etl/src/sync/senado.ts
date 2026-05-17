import type { PrismaClient } from "@smart-politics/db";

import { calculateScoreFromMock } from "../../../scoring/index";
import { fetchSenadores } from "../sources/senado/senado";
import { normalizeSenador, normalizeParty } from "../normalize/senado";

export async function syncSenadoSenadores(prisma: PrismaClient): Promise<void> {
  console.log("Buscando senadores do Senado Federal (mandato atual)...");
  const raw = await fetchSenadores();
  console.log(`  ${raw.length} senadores encontrados.`);

  // Remove only existing senators so deputies are preserved
  await prisma.candidate.deleteMany({ where: { office: "senator" } });
  console.log("  Senadores anteriores removidos.");

  const partySiglas = [...new Set(raw.map((s) => s.SiglaPartidoParlamentar))];
  console.log(`  ${partySiglas.length} partidos distintos.`);

  const partyMap = new Map<string, string>();
  for (const sigla of partySiglas) {
    const normalized = normalizeParty(sigla);
    const party = await prisma.party.upsert({
      where: { acronym: normalized.acronym },
      update: { name: normalized.name, colorHex: normalized.colorHex, ideology: normalized.ideology },
      create: normalized,
    });
    partyMap.set(sigla, party.id);
  }
  console.log(`  ${partyMap.size} partidos sincronizados.`);

  // Deduplicate by senadoId
  const unique = [...new Map(raw.map((s) => [s.CodigoParlamentar, s])).values()];
  console.log(`  ${unique.length} senadores únicos (${raw.length - unique.length} duplicatas removidas).`);

  let synced = 0;
  let skipped = 0;
  const usedSlugs = new Set<string>();

  for (const sen of unique) {
    const normalized = normalizeSenador(sen);
    const partyId = partyMap.get(sen.SiglaPartidoParlamentar);
    if (!partyId) { skipped++; continue; }

    let slug = normalized.slug;
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${normalized.siglaUf.toLowerCase()}`;
    }
    usedSlugs.add(slug);

    const senadoId = Number(normalized.senadoId);
    const seed = Number.isFinite(senadoId) ? senadoId : Math.abs(slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0));

    const candidate = await prisma.candidate.create({
      data: {
        tseId: normalized.senadoId,
        name: normalized.name,
        slug,
        office: "senator",
        state: normalized.siglaUf,
        photoUrl: normalized.photoUrl || null,
        partyId,
      },
    });

    const scores = calculateScoreFromMock(seed);
    await prisma.score.create({
      data: { candidateId: candidate.id, ...scores },
    });

    synced++;
    if (synced % 20 === 0) console.log(`  Progresso: ${synced}/${unique.length}`);
  }

  console.log(`\nSincronização concluída: ${synced} senadores, ${skipped} ignorados.`);
}
