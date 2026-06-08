import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import type { Prisma } from "@smart-politics/db";
import {
  calculateScore,
  SCORE_VERSION,
  type PoliticalRole,
  type RawScoreInput,
} from "@smart-politics/scoring";
import {
  fetchDeputados,
  fetchVotacoes,
  fetchProposicoesDeputado,
  fetchPublicouDespesas,
  fetchOrgaos,
  fetchSenadores,
  fetchSenadorVotacoes,
  fetchSenadorMaterias,
  normalizeDeputado,
  normalizeParty,
  normalizeSenador,
  buildDeputadoScoreInput,
  buildSenadorScoreInput,
  GOVERNORS_SEED,
  PRESIDENTS_SEED,
  CURATED_SCORE_INPUTS,
  buildVoteEvent,
  fetchAllPresidentialBens,
  fetchGovernorBens,
  parseTseValue,
  normalizeTipoAtivo,
  fetchCnjProfile,
  type SeedPolitician,
  type CamaraVoto,
  type CnjPoliticianProfile,
} from "@smart-politics/etl";

import { PrismaService } from "../../config/prisma.service";
import { IntelligenceService } from "../intelligence/intelligence.service";

// ─── Constants ────────────────────────────────────────────────────────────────

// Score zerado para políticos sem dados reais — evita ranking falso
const ZERO_SCORE: Omit<Prisma.ScoreCreateInput, "politician"> = {
  overall: 0,
  education: 0,
  health: 0,
  security: 0,
  economy: 0,
  environment: 0,
  infrastructure: 0,
  technology: 0,
  agriculture: 0,
  international: 0,
  culture: 0,
  socialRights: 0,
  entrepreneurship: 0,
  transparency: 0,
  constitutional: 0,
  fiscal: 0,
  activity: 0,
  integrityMultiplier: 1.0,
  penalties: [] as unknown as Prisma.InputJsonValue,
  scoreVersion: SCORE_VERSION,
  scoreType: "mock",
};

const OFFICE_TO_ROLE: Record<string, PoliticalRole> = {
  president:      "president",
  governor:       "governor",
  senator:        "senator",
  federal_deputy: "federal_deputy",
  state_deputy:   "state_deputy",
};

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class EtlService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly intelligence: IntelligenceService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  /**
   * Garante que governadores e presidentes existam no DB ao iniciar a aplicação.
   * Roda apenas uma vez se o DB estiver vazio para esses cargos.
   */
  async onApplicationBootstrap(): Promise<void> {
    const [govCount, presCount] = await Promise.all([
      this.prisma.politician.count({ where: { office: "governor" } }),
      this.prisma.politician.count({ where: { office: "president" } }),
    ]);

    // Re-seed if count is below expected (handles partial seeds from crashed runs)
    const tasks: Promise<unknown>[] = [];
    if (govCount < GOVERNORS_SEED.length) {
      this.logger.log(`Governors in DB: ${govCount}/${GOVERNORS_SEED.length} — syncing...`);
      tasks.push(this.syncGovernors());
    }
    if (presCount < PRESIDENTS_SEED.length) {
      this.logger.log(`Presidents in DB: ${presCount}/${PRESIDENTS_SEED.length} — syncing...`);
      tasks.push(this.syncPresidents());
    }
    if (tasks.length > 0) {
      await Promise.all(tasks);
      this.logger.log("Initial seed completed.");
    }
  }

  private async invalidateCache(): Promise<void> {
    try {
      const store = this.cache as unknown as { reset?(): Promise<void>; clear?(): Promise<void> };
      if (typeof store.reset === "function") await store.reset();
      else if (typeof store.clear === "function") await store.clear();
    } catch {
      // In-memory cache may not expose reset(); data integrity is not affected
      this.logger.debug("Cache invalidation skipped — store does not support reset()");
    }
  }

  // ─── Shared helpers ──────────────────────────────────────────────────────────

  private async upsertPartiesFromSeed(seeds: SeedPolitician[]): Promise<Map<string, string>> {
    const partySiglas = [...new Set(seeds.map((s) => s.party))];
    const partyMap = new Map<string, string>();
    for (const sigla of partySiglas) {
      const normalized = normalizeParty(sigla);
      const party = await this.prisma.party.upsert({
        where: { acronym: sigla },
        update: { name: normalized.name, colorHex: normalized.colorHex, ideology: normalized.ideology },
        create: normalized,
      });
      partyMap.set(sigla, party.id);
    }
    return partyMap;
  }

  private async upsertSeedPolitician(
    seed: SeedPolitician,
    partyId: string,
  ): Promise<void> {
    const slug = slugify(seed.name);
    const updatePayload = {
      name:                 seed.name,
      state:                seed.state ?? null,
      partyId,
      isPreCandidate:       seed.isPreCandidate ?? false,
      candidateYear:        seed.candidateYear ?? null,
      candidateNumber:      seed.candidateNumber ?? null,
      fichaLimpaIneligible: seed.fichaLimpaIneligible ?? false,
      dataSource:           "manual" as const,
      ...(seed.bio      ? { bio:      seed.bio }      : {}),
      ...(seed.photoUrl ? { photoUrl: seed.photoUrl } : {}),
    };

    // 1) Try by canonical tseId
    let politician = await this.prisma.politician.findUnique({ where: { tseId: seed.tseId } });

    if (politician) {
      politician = await this.prisma.politician.update({ where: { id: politician.id }, data: updatePayload });
    } else {
      // 2) Check slug conflict (politician exists under another tseId — e.g. senator running for president)
      const bySlug = await this.prisma.politician.findUnique({ where: { slug } });
      if (bySlug) {
        // Update the existing record with pre-candidate data; keep the real tseId & office intact
        politician = await this.prisma.politician.update({
          where: { id: bySlug.id },
          data: {
            isPreCandidate: seed.isPreCandidate ?? false,
            candidateYear:  seed.candidateYear ?? null,
            ...(seed.bio      ? { bio:      seed.bio }      : {}),
            ...(seed.photoUrl ? { photoUrl: seed.photoUrl } : {}),
          },
        });
        this.logger.log(`Merged seed "${seed.name}" into existing politician (${bySlug.tseId})`);
      } else {
        // 3) Create fresh — catch P2002 (race condition: watch-mode concurrent restart)
        try {
          politician = await this.prisma.politician.create({
            data: { tseId: seed.tseId, slug, office: seed.office, ...updatePayload },
          });
        } catch (err: unknown) {
          const prismaErr = err as { code?: string };
          if (prismaErr.code !== "P2002") throw err;
          // Another instance just created it — re-fetch and update
          politician = await this.prisma.politician.findUnique({ where: { tseId: seed.tseId } })
            ?? await this.prisma.politician.findUnique({ where: { slug } });
          if (!politician) throw err;
          politician = await this.prisma.politician.update({ where: { id: politician.id }, data: updatePayload });
        }
      }
    }

    const zeroScore = {
      ...ZERO_SCORE,
      ...(seed.fichaLimpaIneligible ? { integrityMultiplier: 0.3 } : {}),
    };

    await this.prisma.score.upsert({
      where:  { politicianId: politician.id },
      update: zeroScore,
      create: { politicianId: politician.id, ...zeroScore },
    });
  }

  // ─── Sync governors ──────────────────────────────────────────────────────────

  async syncGovernors(): Promise<{ synced: number; skipped: number }> {
    this.logger.log("Starting governors sync...");
    const partyMap = await this.upsertPartiesFromSeed(GOVERNORS_SEED);
    let synced = 0;
    let skipped = 0;
    for (const seed of GOVERNORS_SEED) {
      const partyId = partyMap.get(seed.party);
      if (!partyId) { skipped++; continue; }
      await this.upsertSeedPolitician(seed, partyId);
      synced++;
    }
    this.logger.log(`Governors sync complete: ${synced} synced, ${skipped} skipped`);
    await this.invalidateCache();
    return { synced, skipped };
  }

  // ─── Sync presidents ─────────────────────────────────────────────────────────

  async syncPresidents(): Promise<{ synced: number; skipped: number }> {
    this.logger.log("Starting presidents sync...");
    const partyMap = await this.upsertPartiesFromSeed(PRESIDENTS_SEED);
    let synced = 0;
    let skipped = 0;
    for (const seed of PRESIDENTS_SEED) {
      const partyId = partyMap.get(seed.party);
      if (!partyId) { skipped++; continue; }
      await this.upsertSeedPolitician(seed, partyId);
      synced++;
    }
    this.logger.log(`Presidents sync complete: ${synced} synced, ${skipped} skipped`);
    await this.invalidateCache();
    return { synced, skipped };
  }

  // ─── Sync federal deputies ───────────────────────────────────────────────────

  async syncCamaraDeputados(): Promise<{ synced: number; skipped: number }> {
    this.logger.log("Starting Câmara deputies sync...");
    const raw = await fetchDeputados();
    this.logger.log(`Fetched ${raw.length} deputies`);

    const partySiglas = [...new Set(raw.map((d) => d.siglaPartido))];
    const partyMap = new Map<string, string>();

    for (const sigla of partySiglas) {
      const normalized = normalizeParty(sigla);
      const party = await this.prisma.party.upsert({
        where: { acronym: sigla },
        update: { name: normalized.name, colorHex: normalized.colorHex, ideology: normalized.ideology },
        create: normalized,
      });
      partyMap.set(sigla, party.id);
    }

    let synced = 0;
    let skipped = 0;

    for (const dep of raw) {
      const partyId = partyMap.get(dep.siglaPartido);
      if (!partyId) { skipped++; continue; }

      const { name, slug } = normalizeDeputado(dep);

      const politician = await this.prisma.politician.upsert({
        where: { tseId: String(dep.id) },
        update: { name, slug, photoUrl: dep.urlFoto, state: dep.siglaUf, partyId, dataSource: "api" },
        create: {
          tseId:      String(dep.id),
          name,
          slug,
          office:     "federal_deputy",
          state:      dep.siglaUf,
          photoUrl:   dep.urlFoto,
          partyId,
          dataSource: "api",
        },
      });

      let scoreInput: RawScoreInput | null = null;
      let fetchedVotacoes: CamaraVoto[] = [];

      try {
        const [votacoes, proposicoes, publicouDespesas, orgaos] = await Promise.all([
          fetchVotacoes(dep.id, 150),
          fetchProposicoesDeputado(dep.id),
          fetchPublicouDespesas(dep.id),
          fetchOrgaos(dep.id),
        ]);

        fetchedVotacoes = votacoes;
        scoreInput = buildDeputadoScoreInput("federal_deputy", {
          votacoes,
          proposicoes,
          publicouDespesas,
          orgaos,
        });
      } catch {
        this.logger.warn(`Câmara API failed for deputado ${dep.id} — score zerado`);
      }

      let jsonScores: Omit<Prisma.ScoreCreateInput, "politician">;
      if (scoreInput) {
        const { breakdown, penalties, ...scoreFields } = calculateScore(scoreInput);
        jsonScores = {
          ...scoreFields,
          scoreType: "partial",
          breakdown: breakdown as unknown as Prisma.InputJsonValue,
          penalties: penalties as unknown as Prisma.InputJsonValue,
        };
      } else {
        jsonScores = { ...ZERO_SCORE };
      }

      await this.prisma.score.upsert({
        where:  { politicianId: politician.id },
        update: jsonScores,
        create: { politicianId: politician.id, ...jsonScores },
      });

      await this.captureScoreSnapshot(politician.id, jsonScores, "etl_sync");

      if (fetchedVotacoes.length > 0) {
        await this.importVotacoesAsEvents(politician.id, fetchedVotacoes);
      }

      synced++;
    }

    this.logger.log(`Deputies sync complete: ${synced} synced, ${skipped} skipped`);
    await this.invalidateCache();
    return { synced, skipped };
  }

  // ─── Sync senators ───────────────────────────────────────────────────────────

  async syncSenadores(): Promise<{ synced: number; skipped: number }> {
    this.logger.log("Starting Senate senators sync...");
    const raw = await fetchSenadores();
    this.logger.log(`Fetched ${raw.length} senators`);

    const partySiglas = [...new Set(raw.map((s) => s.SiglaPartidoParlamentar))];
    const partyMap = new Map<string, string>();

    for (const sigla of partySiglas) {
      const normalized = normalizeParty(sigla);
      const party = await this.prisma.party.upsert({
        where: { acronym: sigla },
        update: { name: normalized.name, colorHex: normalized.colorHex, ideology: normalized.ideology },
        create: normalized,
      });
      partyMap.set(sigla, party.id);
    }

    let synced = 0;
    let skipped = 0;
    const usedSlugs = new Set<string>();

    for (const sen of raw) {
      const partyId = partyMap.get(sen.SiglaPartidoParlamentar);
      if (!partyId) { skipped++; continue; }

      const normalized = normalizeSenador(sen);
      let { slug } = normalized;
      if (usedSlugs.has(slug)) slug = `${slug}-${normalized.siglaUf.toLowerCase()}`;
      usedSlugs.add(slug);

      const politician = await this.prisma.politician.upsert({
        where: { tseId: normalized.senadoId },
        update: {
          name: normalized.name,
          slug,
          photoUrl: normalized.photoUrl || null,
          state: normalized.siglaUf,
          partyId,
          dataSource: "api",
        },
        create: {
          tseId:      normalized.senadoId,
          name:       normalized.name,
          slug,
          office:     "senator",
          state:      normalized.siglaUf,
          photoUrl:   normalized.photoUrl || null,
          partyId,
          dataSource: "api",
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
        this.logger.warn(`Senado API failed for senador ${normalized.senadoId} — score zerado`);
      }

      let jsonScores: Omit<Prisma.ScoreCreateInput, "politician">;
      if (scoreInput) {
        const { breakdown, penalties, ...scoreFields } = calculateScore(scoreInput);
        jsonScores = {
          ...scoreFields,
          scoreType: "partial",
          breakdown: breakdown as unknown as Prisma.InputJsonValue,
          penalties: penalties as unknown as Prisma.InputJsonValue,
        };
      } else {
        jsonScores = { ...ZERO_SCORE };
      }

      await this.prisma.score.upsert({
        where:  { politicianId: politician.id },
        update: jsonScores,
        create: { politicianId: politician.id, ...jsonScores },
      });

      synced++;
    }

    this.logger.log(`Senators sync complete: ${synced} synced, ${skipped} skipped`);
    await this.invalidateCache();
    return { synced, skipped };
  }

  // ─── PoliticalEvents import ──────────────────────────────────────────────────

  private async importVotacoesAsEvents(
    politicianId: string,
    votacoes: CamaraVoto[],
  ): Promise<void> {
    for (const voto of votacoes) {
      const input = buildVoteEvent(politicianId, voto);
      try {
        await this.prisma.politicalEvent.upsert({
          where: {
            politicianId_externalId: {
              politicianId: input.politicianId,
              externalId: input.externalId,
            },
          },
          update: {},
          create: {
            politicianId: input.politicianId,
            type: input.type,
            title: input.title,
            description: input.description,
            eventDate: input.eventDate,
            externalId: input.externalId,
            sourceUrl: input.sourceUrl ?? null,
            sourceLabel: input.sourceLabel,
            metadata: input.metadata as unknown as Prisma.InputJsonValue,
          },
        });
      } catch {
        // Individual vote failures should not abort the loop
      }
    }
  }

  private async captureScoreSnapshot(
    politicianId: string,
    scores: Omit<Prisma.ScoreCreateInput, "politician">,
    trigger: string,
  ): Promise<void> {
    try {
      const last = await this.prisma.scoreHistory.findFirst({
        where: { politicianId },
        orderBy: { snapshotAt: "desc" },
        select: { overall: true },
      });

      const currentOverall = typeof scores.overall === "number" ? scores.overall : 0;
      if (last && Math.abs(last.overall - currentOverall) <= 0.05) return;

      await this.prisma.scoreHistory.create({
        data: {
          politicianId,
          overall: currentOverall,
          education: (scores.education as number) ?? 0,
          health: (scores.health as number) ?? 0,
          security: (scores.security as number) ?? 0,
          economy: (scores.economy as number) ?? 0,
          environment: (scores.environment as number) ?? 0,
          infrastructure: (scores.infrastructure as number) ?? 0,
          technology: (scores.technology as number) ?? 0,
          agriculture: (scores.agriculture as number) ?? 0,
          international: (scores.international as number) ?? 0,
          culture: (scores.culture as number) ?? 0,
          socialRights: (scores.socialRights as number) ?? 0,
          entrepreneurship: (scores.entrepreneurship as number) ?? 0,
          transparency: (scores.transparency as number) ?? 0,
          constitutional: (scores.constitutional as number) ?? 0,
          fiscal: (scores.fiscal as number) ?? 0,
          activity: (scores.activity as number) ?? 0,
          integrityMultiplier: (scores.integrityMultiplier as number) ?? 1.0,
          scoreVersion: (scores.scoreVersion as string) ?? SCORE_VERSION,
          scoreType: (scores.scoreType as "mock" | "partial" | "real") ?? "mock",
          trigger,
        },
      });
    } catch (err) {
      this.logger.warn(`captureScoreSnapshot failed for ${politicianId}: ${String(err)}`);
    }
  }

  async interpretPendingEvents(limit = 50): Promise<{ processed: number; errors: number }> {
    const events = await this.prisma.politicalEvent.findMany({
      where: { interpretationHash: null },
      orderBy: { eventDate: "desc" },
      take: Math.min(limit, 200),
      include: { politician: { select: { name: true, slug: true } } },
    });

    this.logger.log(`Interpreting ${events.length} pending events...`);
    let processed = 0;
    let errors = 0;

    for (const event of events) {
      try {
        const result = await this.intelligence.interpret({
          type: "vote",
          title: event.title,
          description: event.description,
          date: event.eventDate.toISOString(),
          politicians: [event.politician.slug],
        });

        // coverage_direction descreve direção de mudança (expansivo/restritivo/neutro/misto)
        // NÃO é julgamento de valor — sentiment=0 para todos os eventos de votação.
        // Sentiment é reservado para fatos objetivos (ex: condenação=−1, absolvição=+1).
        const sentiment = 0;

        await this.prisma.politicalEvent.update({
          where: { id: event.id },
          data: {
            interpretationHash: result.inputHash,
            topics: result.topics,
            sentiment,
            impact: Math.min(10, Math.max(1, Math.round(result.relevance_score / 10))),
          },
        });

        await this.generateScoreEvidence(event.politicianId, event.id, result);
        processed++;
      } catch (err) {
        this.logger.warn(`interpretPendingEvents: event ${event.id} failed — ${String(err)}`);
        errors++;
      }

      await new Promise<void>((r) => setTimeout(r, 500));
    }

    this.logger.log(`Interpretation done: ${processed} processed, ${errors} errors`);
    return { processed, errors };
  }

  /**
   * Registra evidências de participação em votações classificadas por tema.
   *
   * METODOLOGIA IMPARCIAL:
   * - deltaValue = relevância do evento (positivo = relevante, nunca negativo)
   * - NÃO usa coverage_direction para sinal: evento presente no tema = atividade positiva
   * - Evidência registrada apenas para eventos com relevância >= 30 (limiar de significância)
   *
   * Intenção: mostrar ao usuário "o político participou de votações sobre X temas".
   * NÃO intenção: "o político votou certo/errado em X".
   */
  private async generateScoreEvidence(
    politicianId: string,
    eventId: string,
    result: { relevance_score: number; coverage_direction: string; topics: string[]; summary_simple: string },
  ): Promise<void> {
    if (result.relevance_score < 30) return;
    if (result.topics.length === 0) return;

    // deltaValue = relevância normalizada (0–2): mede importância do evento, sem viés direcional
    const deltaValue = (result.relevance_score / 100) * 2;

    for (const topic of result.topics.slice(0, 3)) {
      try {
        await this.prisma.scoreEvidence.upsert({
          where: { eventId_dimension: { eventId, dimension: topic } },
          update: {
            explanation: `Participação em votação sobre ${topic}: ${result.summary_simple.slice(0, 200)}`,
            deltaValue,
          },
          create: {
            politicianId,
            eventId,
            dimension: topic,
            explanation: `Participação em votação sobre ${topic}: ${result.summary_simple.slice(0, 200)}`,
            deltaValue,
            scoreVersion: SCORE_VERSION,
          },
        });
      } catch {
        // Non-critical — continue to next topic
      }
    }
  }

  // ─── Sync all ────────────────────────────────────────────────────────────────

  // ─── Curated scores ──────────────────────────────────────────────────────────

  /**
   * Aplica scores curados (baseados em fontes públicas verificáveis) para
   * políticos sem cobertura de API oficial. scoreType = "partial".
   *
   * Idempotente: pode ser executado múltiplas vezes sem duplicar dados.
   */
  async syncCuratedScores(): Promise<{ applied: number; notFound: string[] }> {
    this.logger.log("Starting curated scores sync...");
    let applied = 0;
    const notFound: string[] = [];

    for (const entry of CURATED_SCORE_INPUTS) {
      const politician = await this.prisma.politician.findFirst({
        where: { OR: [{ tseId: entry.tseId }, { name: entry.name }] },
        select: { id: true },
      });

      if (!politician) {
        this.logger.warn(`Curated score: politician not found — ${entry.name} (${entry.tseId})`);
        notFound.push(entry.name);
        continue;
      }

      const result = calculateScore(entry.input);
      const scoreData = {
        overall:              result.overall,
        education:            result.education,
        health:               result.health,
        security:             result.security,
        economy:              result.economy,
        environment:          result.environment,
        infrastructure:       result.infrastructure,
        technology:           result.technology,
        agriculture:          result.agriculture,
        international:        result.international,
        culture:              result.culture,
        socialRights:         result.socialRights,
        entrepreneurship:     result.entrepreneurship,
        transparency:         result.transparency,
        constitutional:       result.constitutional,
        fiscal:               result.fiscal,
        activity:             result.activity,
        integrityMultiplier:  result.integrityMultiplier,
        penalties:            result.penalties as unknown as Prisma.InputJsonValue,
        scoreVersion:         SCORE_VERSION,
        scoreType:            "partial" as const,
      };

      await this.prisma.score.upsert({
        where:  { politicianId: politician.id },
        update: scoreData,
        create: { politicianId: politician.id, ...scoreData },
      });

      await this.captureScoreSnapshot(politician.id, scoreData, "curated_seed");
      this.logger.log(`  Curated score applied: ${entry.name} → ${result.overall.toFixed(1)}`);
      applied++;
    }

    await this.invalidateCache();
    this.logger.log(`Curated scores sync complete: ${applied} applied, ${notFound.length} not found`);
    return { applied, notFound };
  }

  // ─── TSE patrimônio ───────────────────────────────────────────────────────────

  /**
   * Busca declarações de bens do TSE para presidentes e governadores.
   * Armazena em AssetDeclaration. Idempotente (@@unique por politician + year).
   *
   * Fonte: TSE DivulgaCandContas — API pública, sem autenticação.
   */
  async syncTseBens(ano: number): Promise<{ created: number; updated: number; errors: string[] }> {
    this.logger.log(`Starting TSE bens sync for ${ano}...`);
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    // ── Presidentes ────────────────────────────────────────────────────────
    try {
      const presidentBens = await fetchAllPresidentialBens(ano);
      this.logger.log(`TSE: ${presidentBens.size} presidential candidates found for ${ano}`);

      for (const [, { candidato, bens, totalBrl }] of presidentBens) {
        // Tentar casar pelo nome normalizado + partido
        const name = candidato.nomeUrna || candidato.nome;
        const partySigla = candidato.partido.sigla;

        const politician = await this.prisma.politician.findFirst({
          where: {
            office: "president",
            party: { acronym: partySigla },
            name: { contains: name.split(" ")[0], mode: "insensitive" },
          },
          select: { id: true, name: true },
        });

        if (!politician) {
          this.logger.debug(`TSE bens: no match for ${name} (${partySigla})`);
          continue;
        }

        const assetsJson = bens.map((b) => ({
          description: b.descricaoDeBem,
          details: b.detalhesDoBem,
          valueBrl: parseTseValue(b.valor),
          assetType: normalizeTipoAtivo(b.tipoDeBem?.descricao ?? ""),
          tseType: b.tipoDeBem?.descricao ?? "",
        }));

        const result = await this.prisma.assetDeclaration.upsert({
          where: { politicianId_year: { politicianId: politician.id, year: ano } },
          update: {
            totalValueBrl: totalBrl || assetsJson.reduce((s, a) => s + a.valueBrl, 0),
            assets: assetsJson as unknown as Prisma.InputJsonValue,
            sourceLabel: `TSE DivulgaCandContas ${ano}`,
            declarationUrl: `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/${ano}/BR/1/${candidato.id}/bens`,
          },
          create: {
            politicianId: politician.id,
            year: ano,
            totalValueBrl: totalBrl || assetsJson.reduce((s, a) => s + a.valueBrl, 0),
            assets: assetsJson as unknown as Prisma.InputJsonValue,
            sourceLabel: `TSE DivulgaCandContas ${ano}`,
            declarationUrl: `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/${ano}/BR/1/${candidato.id}/bens`,
          },
        });
        if (result) {
          this.logger.log(`  TSE bens: ${politician.name} — R$ ${totalBrl.toLocaleString("pt-BR")}`);
          // distingue created vs updated pelo campo updatedAt
          created++;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`TSE presidents bens error: ${msg}`);
      errors.push(`presidents: ${msg}`);
    }

    // ── Governadores ────────────────────────────────────────────────────────
    const govStates = [...new Set(GOVERNORS_SEED.map((g) => g.state!).filter(Boolean))];

    for (const uf of govStates) {
      try {
        const govBens = await fetchGovernorBens(ano, uf);

        for (const [, { candidato, bens, totalBrl }] of govBens) {
          const name = candidato.nomeUrna || candidato.nome;
          const partySigla = candidato.partido.sigla;

          const politician = await this.prisma.politician.findFirst({
            where: {
              office: "governor",
              state: uf,
              party: { acronym: partySigla },
              name: { contains: name.split(" ")[0], mode: "insensitive" },
            },
            select: { id: true, name: true },
          });

          if (!politician) continue;

          const assetsJson = bens.map((b) => ({
            description: b.descricaoDeBem,
            details: b.detalhesDoBem,
            valueBrl: parseTseValue(b.valor),
            assetType: normalizeTipoAtivo(b.tipoDeBem?.descricao ?? ""),
            tseType: b.tipoDeBem?.descricao ?? "",
          }));

          await this.prisma.assetDeclaration.upsert({
            where: { politicianId_year: { politicianId: politician.id, year: ano } },
            update: {
              totalValueBrl: totalBrl || assetsJson.reduce((s, a) => s + a.valueBrl, 0),
              assets: assetsJson as unknown as Prisma.InputJsonValue,
              sourceLabel: `TSE DivulgaCandContas ${ano}`,
            },
            create: {
              politicianId: politician.id,
              year: ano,
              totalValueBrl: totalBrl || assetsJson.reduce((s, a) => s + a.valueBrl, 0),
              assets: assetsJson as unknown as Prisma.InputJsonValue,
              sourceLabel: `TSE DivulgaCandContas ${ano}`,
            },
          });
          created++;
          this.logger.log(`  TSE bens (${uf}): ${politician.name}`);
        }

        await new Promise((r) => setTimeout(r, 500)); // pausa entre estados
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`TSE governors bens ${uf}: ${msg}`);
        errors.push(`${uf}: ${msg}`);
      }
    }

    await this.invalidateCache();
    this.logger.log(`TSE bens sync complete: ${created} created, ${updated} updated, ${errors.length} errors`);
    return { created, updated, errors };
  }

  // ─── Sync integridade via CNJ Datajud ────────────────────────────────────────

  /**
   * Enriquece dados de integridade (processos criminais) via CNJ Datajud.
   *
   * ─── O QUE FAZ ────────────────────────────────────────────────────────────
   * 1. Para cada político (deputados e senadores, em lote):
   *    a. Busca processos no CNJ Datajud onde o político é réu/investigado.
   *    b. Armazena cada processo como `PoliticianFact` (type=court_case).
   *    c. Recalcula o score de integridade e atualiza `Score.integrityMultiplier`.
   *
   * ─── LIMITAÇÕES CONHECIDAS ────────────────────────────────────────────────
   * - Busca por nome tem risco de falsos positivos (homônimos).
   *   O CNJ client filtra por tipo de parte (réu/investigado) para reduzir isso.
   * - Caps conservadores são aplicados para não penalizar injustamente.
   * - Processos anulados por incompetência de juízo NÃO contam como condenação.
   *
   * ─── FONTES ───────────────────────────────────────────────────────────────
   * CNJ Datajud — API pública: https://api-publica.datajud.cnj.jus.br/
   * Tribunais consultados: STF, STJ, TRFs, TJs principais.
   */
  async syncIntegrityFromCnj(
    limit = 50,
  ): Promise<{ processed: number; enriched: number; errors: number; skipped: number }> {
    this.logger.log(`Starting CNJ integrity sync (limit=${limit})...`);

    // Processa deputados e senadores (não curados manualmente)
    const politicians = await this.prisma.politician.findMany({
      where: {
        score: { scoreType: { in: ["partial", "mock"] } },
        office: { in: ["federal_deputy", "senator"] },
      },
      select: { id: true, name: true },
      take: Math.min(limit, 200),
      orderBy: { updatedAt: "asc" },
    });

    this.logger.log(`CNJ: ${politicians.length} politicians to process`);

    let processed = 0;
    let enriched  = 0;
    let errors    = 0;
    let skipped   = 0;

    for (const politician of politicians) {
      try {
        const profile: CnjPoliticianProfile = await fetchCnjProfile(
          politician.name,
          undefined,               // usa tribunais prioritários padrão
          process.env.CNJ_API_KEY, // chave opcional para maior rate limit
        );

        if (profile.totalProcessos > 0) {
          // ── 1. Persiste cada processo como PoliticianFact ─────────────────
          for (const processo of profile.processos) {
            const numProcesso = processo.numeroProcesso ?? "sem-número";
            const classe      = processo.classeProcessual?.nome ?? "Processo";
            const tribunal    = processo.tribunal ?? "CNJ";
            const dataAj      = processo.dataAjuizamento
              ? new Date(processo.dataAjuizamento)
              : null;

            // Idempotente: único por (politicianId, source contendo o número)
            const existing = await this.prisma.politicianFact.findFirst({
              where: {
                politicianId: politician.id,
                type: "court_case",
                source: { contains: numProcesso },
              },
              select: { id: true },
            });

            if (!existing) {
              await this.prisma.politicianFact.create({
                data: {
                  politicianId: politician.id,
                  type:         "court_case",
                  title:        `${classe} — ${tribunal}`,
                  description:  `Processo ${numProcesso} no ${tribunal}. Fonte: CNJ Datajud.`,
                  source:       `CNJ Datajud — ${numProcesso}`,
                  sourceUrl:    `https://api-publica.datajud.cnj.jus.br/`,
                  date:         dataAj,
                  verifiedAt:   new Date(),
                  verifiedBy:   "cnj-datajud-api",
                  sentiment:    -1,   // réu/investigado: contexto negativo para integridade
                  impact:       5,
                  tags:         ["cnj", "processo-judicial", tribunal.toLowerCase()],
                },
              });
            }
          }

          // ── 2. Recalcula integrityMultiplier com dados CNJ ────────────────
          const currentScore = await this.prisma.score.findUnique({
            where:  { politicianId: politician.id },
            select: { overall: true, transparency: true, activity: true, fiscal: true, constitutional: true },
          });

          if (currentScore) {
            const { criminalConvictions, criminalCharges, mpChargesAccepted } =
              this.buildIntegrityFromProfile(profile);

            // Recalcula apenas o multiplier — mantém os outros pilares do score atual
            const { multiplier, penalties } = this.calcIntegrityMultiplierFromCnj({
              criminalConvictions,
              criminalCharges,
              mpChargesAccepted,
            });

            // Recalcula overall com o novo multiplier (usando o baseScore atual implícito)
            const currentOverall  = currentScore.overall;
            const currentMultiplier = currentOverall > 0
              ? Math.min(1.0, currentOverall / Math.max(0.1, currentOverall))
              : 1.0;

            // BaseScore = overall / multiplier_anterior (estimado)
            const baseScore = currentMultiplier > 0
              ? Math.min(10, currentOverall / currentMultiplier)
              : currentOverall;
            const newOverall = Math.round(Math.min(10, baseScore * multiplier) * 10) / 10;

            await this.prisma.score.update({
              where: { politicianId: politician.id },
              data:  {
                integrityMultiplier: multiplier,
                overall:             newOverall,
                penalties:           penalties as unknown as Prisma.InputJsonValue,
              },
            });

            await this.captureScoreSnapshot(
              politician.id,
              { ...currentScore, overall: newOverall, integrityMultiplier: multiplier, penalties: penalties as unknown as Prisma.InputJsonValue, scoreVersion: SCORE_VERSION, scoreType: "partial" },
              "cnj_sync",
            );
          }

          enriched++;
          this.logger.debug(
            `CNJ: ${politician.name} — processos=${profile.totalProcessos}, ativos=${profile.criminaisAtivos}`,
          );
        }

        processed++;
        await new Promise((r) => setTimeout(r, 250)); // rate limit: 4 req/s
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`CNJ: failed for ${politician.name} — ${msg}`);
        errors++;
      }
    }

    await this.invalidateCache();
    this.logger.log(
      `CNJ sync done: ${processed} processed, ${enriched} enriched, ${errors} errors, ${skipped} skipped`,
    );
    return { processed, enriched, errors, skipped };
  }

  /** Extrai campos de integridade do perfil CNJ com caps conservadores. */
  private buildIntegrityFromProfile(
    profile: CnjPoliticianProfile,
  ): { criminalConvictions: number; criminalCharges: number; mpChargesAccepted: number } {
    return {
      criminalConvictions: Math.min(profile.criminaisEncerrados, 3),
      criminalCharges:     Math.min(profile.criminaisAtivos, 5),
      mpChargesAccepted:   Math.min(profile.criminaisAtivos, 3),
    };
  }

  /**
   * Calcula o integrityMultiplier baseado apenas nos campos CNJ disponíveis.
   * Reproduz a mesma lógica do scoring engine para os campos que temos dados.
   */
  private calcIntegrityMultiplierFromCnj(fields: {
    criminalConvictions: number;
    criminalCharges:     number;
    mpChargesAccepted:   number;
  }): { multiplier: number; penalties: { reason: string; penalty: number; source: string }[] } {
    const penalties: { reason: string; penalty: number; source: string }[] = [];
    let total = 0;

    const add = (count: number, penaltyPer: number, reason: string, source: string, maxCap: number) => {
      if (count <= 0) return;
      const p = Math.round(Math.min(penaltyPer * count, maxCap) * 100) / 100;
      total += p;
      penalties.push({ reason, penalty: p, source });
    };

    add(fields.criminalConvictions, 0.50, "Condenação criminal transitada em julgado",   "STF / STJ / TJ estaduais (CNJ Datajud)", 0.60);
    add(fields.criminalCharges,     0.20, "Réu em processo criminal ativo",               "STF / STJ / TJ estaduais (CNJ Datajud)", 0.40);
    add(fields.mpChargesAccepted,   0.10, "Denúncia aceita pelo Ministério Público",      "Ministério Público (CNJ Datajud)",        0.20);

    const multiplier = Math.round(Math.min(Math.max(1.0 - total, 0.3), 1.0) * 100) / 100;
    return { multiplier, penalties };
  }

  async syncAll(): Promise<{
    governors: { synced: number; skipped: number };
    presidents: { synced: number; skipped: number };
    deputies: { synced: number; skipped: number };
    senators: { synced: number; skipped: number };
  }> {
    const [governors, presidents, deputies, senators] = await Promise.all([
      this.syncGovernors(),
      this.syncPresidents(),
      this.syncCamaraDeputados(),
      this.syncSenadores(),
    ]);
    return { governors, presidents, deputies, senators };
  }
}
