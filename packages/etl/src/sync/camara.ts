import type { PrismaClient } from "@smart-politics/db";
import { calculateScore, SCORE_VERSION } from "@smart-politics/scoring";
import type { RawScoreInput } from "@smart-politics/scoring";
import { fetchDeputados, fetchVotacoes } from "../sources/camara/camara";
import { fetchProposicoesDeputado } from "../sources/camara/proposicoes";
import { fetchPublicouDespesas } from "../sources/camara/despesas";
import { fetchOrgaos } from "../sources/camara/orgaos";
import { normalizeDeputado, normalizeParty } from "../normalize/camara";
import { buildDeputadoScoreInput } from "../builders/score-input-builder";

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

export async function syncCamaraDeputados(prisma: PrismaClient): Promise<{ synced: number; skipped: number }> {
  console.log("Buscando deputados da Câmara dos Deputados (57ª legislatura)...");
  const raw = await fetchDeputados();
  console.log(`  ${raw.length} deputados encontrados.`);

  const partySiglas = [...new Set(raw.map((d) => d.siglaPartido))];
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
  const p = prisma as never as {
    politician: { upsert: (args: unknown) => Promise<{ id: string }> };
    score: { upsert: (args: unknown) => Promise<unknown> };
  };

  for (const dep of raw) {
    const partyId = partyMap.get(dep.siglaPartido);
    if (!partyId) { skipped++; continue; }

    const { name, slug } = normalizeDeputado(dep);

    const politician = await p.politician.upsert({
      where: { tseId: String(dep.id) },
      update: { name, slug, photoUrl: dep.urlFoto, state: dep.siglaUf, partyId, dataSource: "api" },
      create: {
        tseId: String(dep.id), name, slug,
        office: "federal_deputy", state: dep.siglaUf,
        photoUrl: dep.urlFoto, partyId, dataSource: "api",
      },
    });

    // Cada função retorna valor seguro em caso de erro (nunca rejeita)
    const [votacoes, proposicoes, publicouDespesas, orgaos] = await Promise.all([
      fetchVotacoes(dep.id, 150),
      fetchProposicoesDeputado(dep.id),
      fetchPublicouDespesas(dep.id),
      fetchOrgaos(dep.id),
    ]);

    // Só monta scoreInput se pelo menos um campo tem dado real
    let scoreInput: RawScoreInput | null = null;
    const hasRealData = votacoes.length > 0 || proposicoes.proposed > 0 || publicouDespesas || orgaos.length > 0;
    if (hasRealData) {
      scoreInput = buildDeputadoScoreInput("federal_deputy", { votacoes, proposicoes, publicouDespesas, orgaos });
    }

    // Delay para respeitar rate limit da Câmara API
    await new Promise((r) => setTimeout(r, 300));

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
    if (synced % 50 === 0) process.stdout.write(`\r  Progresso: ${synced}/${raw.length}   `);
  }

  console.log(`\n  Câmara: ${synced} deputados sincronizados, ${skipped} ignorados.`);
  return { synced, skipped };
}
