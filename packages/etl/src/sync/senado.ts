import type { PrismaClient } from "@smart-politics/db";
import { calculateScore, SCORE_VERSION } from "@smart-politics/scoring";
import type { RawScoreInput } from "@smart-politics/scoring";
import { fetchSenadores, fetchSenadorVotacoes, fetchSenadorMaterias } from "../sources/senado/senado";
import { normalizeSenador } from "../normalize/senado";
import { normalizeParty } from "../normalize/camara";
import { buildSenadorScoreInput } from "../builders/score-input-builder";

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

export async function syncSenadoSenadores(prisma: PrismaClient): Promise<{ synced: number; skipped: number }> {
  console.log("Buscando senadores do Senado Federal (mandato atual)...");
  const raw = await fetchSenadores();
  console.log(`  ${raw.length} senadores encontrados.`);

  const partySiglas = [...new Set(raw.map((s) => s.SiglaPartidoParlamentar))];
  const partyMap = new Map<string, string>();
  for (const sigla of partySiglas) {
    const normalized = normalizeParty(sigla);
    const party = await (prisma as never as { party: { upsert: (args: unknown) => Promise<{ id: string }> } }).party.upsert({
      where: { acronym: sigla },
      update: { name: normalized.name, colorHex: normalized.colorHex, ideology: normalized.ideology },
      create: normalized,
    });
    partyMap.set(sigla, party.id);
  }
  console.log(`  ${partyMap.size} partidos sincronizados.`);

  let synced = 0;
  let skipped = 0;
  const usedSlugs = new Set<string>();
  const p = prisma as never as {
    politician: { upsert: (args: unknown) => Promise<{ id: string }> };
    score: { upsert: (args: unknown) => Promise<unknown> };
  };

  for (const sen of raw) {
    const partyId = partyMap.get(sen.SiglaPartidoParlamentar);
    if (!partyId) { skipped++; continue; }

    const normalized = normalizeSenador(sen);
    let { slug } = normalized;
    if (usedSlugs.has(slug)) slug = `${slug}-${normalized.siglaUf.toLowerCase()}`;
    usedSlugs.add(slug);

    const politician = await p.politician.upsert({
      where: { tseId: normalized.senadoId },
      update: { name: normalized.name, slug, photoUrl: normalized.photoUrl || null, state: normalized.siglaUf, partyId, dataSource: "api" },
      create: {
        tseId: normalized.senadoId, name: normalized.name, slug,
        office: "senator", state: normalized.siglaUf,
        photoUrl: normalized.photoUrl || null, partyId, dataSource: "api",
      },
    });

    let scoreInput: RawScoreInput | null = null;
    try {
      const [votacoes, materias] = await Promise.all([
        fetchSenadorVotacoes(normalized.senadoId),
        fetchSenadorMaterias(normalized.senadoId),
      ]);
      if (votacoes.length > 0 || materias.proposed > 0) {
        scoreInput = buildSenadorScoreInput({ votacoes, materias });
      }
    } catch {
      // API failure — score zerado
    }

    let jsonScores: Record<string, unknown>;
    if (scoreInput) {
      const { breakdown, penalties, ...scoreFields } = calculateScore(scoreInput);
      jsonScores = { ...scoreFields, scoreType: "partial", breakdown, penalties };
    } else {
      jsonScores = { ...ZERO_SCORE };
    }

    await p.score.upsert({
      where: { politicianId: politician.id },
      update: jsonScores,
      create: { politicianId: politician.id, ...jsonScores },
    });

    synced++;
    if (synced % 20 === 0) process.stdout.write(`\r  Progresso: ${synced}/${raw.length}   `);
  }

  console.log(`\n  Senado: ${synced} senadores sincronizados, ${skipped} ignorados.`);
  return { synced, skipped };
}
