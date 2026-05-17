import type { PrismaClient } from "@smart-politics/db";
import { calculateScoreFromMock } from "../../../scoring/index";
import { fetchDeputados } from "../sources/camara/camara";
import { normalizeDeputado, normalizeParty } from "../normalize/camara";

export async function syncCamaraDeputados(prisma: PrismaClient): Promise<void> {
  console.log("Buscando deputados da Câmara dos Deputados (57ª legislatura)...");
  const raw = await fetchDeputados();
  console.log(`  ${raw.length} deputados encontrados.`);

  // Clear all candidates for a clean idempotent sync (seed data is placeholder)
  await prisma.candidate.deleteMany({});
  console.log("  Todos os candidatos anteriores removidos.");

  // Collect all unique parties from the response
  const partySiglas = [...new Set(raw.map((d) => d.siglaPartido))];
  console.log(`  ${partySiglas.length} partidos distintos.`);

  // Upsert parties
  const partyMap = new Map<string, string>(); // acronym → party.id
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

  // Deduplicate by tseId (API may return substitutes/replacements as extra rows)
  const unique = [...new Map(raw.map((d) => [d.id, d])).values()];
  console.log(`  ${unique.length} deputados únicos (${raw.length - unique.length} duplicatas removidas).`);

  // Insert deputies + scores (slugs deduplicated with state suffix)
  let synced = 0;
  let skipped = 0;
  const usedSlugs = new Set<string>();

  for (const dep of unique) {
    const normalized = normalizeDeputado(dep);
    const partyId = partyMap.get(dep.siglaPartido);
    if (!partyId) { skipped++; continue; }

    // Ensure slug uniqueness within this batch
    let slug = normalized.slug;
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${(normalized.siglaUf ?? dep.id).toString().toLowerCase()}`;
    }
    usedSlugs.add(slug);

    const candidate = await prisma.candidate.create({
      data: {
        tseId: String(dep.id),
        name: normalized.name,
        slug,
        office: "federal_deputy",
        state: normalized.siglaUf,
        photoUrl: normalized.photoUrl,
        partyId,
      },
    });

    const scores = calculateScoreFromMock(dep.id);
    await prisma.score.create({
      data: { candidateId: candidate.id, ...scores },
    });

    synced++;
    if (synced % 100 === 0) console.log(`  Progresso: ${synced}/${raw.length}`);
  }

  console.log(`\nSincronização concluída: ${synced} deputados, ${skipped} ignorados.`);
}
