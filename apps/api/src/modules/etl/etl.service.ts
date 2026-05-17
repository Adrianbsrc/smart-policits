import { Inject, Injectable, Logger } from "@nestjs/common";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import type { PartyIdeology, Prisma } from "@smart-politics/db";
import {
  calculateScore,
  calculateScoreFromMock,
  type PoliticalRole,
  type RawScoreInput,
  type IntegrityInput,
  type TransparencyInput,
  type FiscalInput,
  type ConstitutionalInput,
  type ThematicInput,
} from "@smart-politics/scoring";

import { PrismaService } from "../../config/prisma.service";
import { CamaraApiService } from "./camara-api.service";

const CAMARA_BASE = "https://dadosabertos.camara.leg.br/api/v2";
const LEGISLATURA = 57;

// ─── Score neutros (usados quando dados reais não estão disponíveis) ──────────
// Neutro ≠ zero: evita penalizar por ausência de dados.

const NEUTRAL_INTEGRITY: IntegrityInput = {
  criminalConvictions: 0, criminalCharges: 0, tcuConvictions: 0,
  tcuPendingInvestigations: 0, ethicsViolations: 0,
  mandateCancelledPrevious: false, fichaLimpaIneligible: false,
  mpChargesAccepted: 0, patrimonyInconsistencyPercent: 0,
  provenFalseDeclarations: 0,
};

const NEUTRAL_FISCAL: FiscalInput = {
  budgetBalanceScore: 5, publicDebtDelta: 0,
  tcuAuditScore: 5, expenseEfficiencyScore: 5,
};

const NEUTRAL_CONSTITUTIONAL: ConstitutionalInput = {
  fundamentalRightsScore: 5, powerSeparationScore: 5,
  legalityScore: 5, institutionalCoherenceScore: 5,
};

const NEUTRAL_THEMATIC: ThematicInput = {
  education: 50, health: 50, security: 50, economy: 50,
  environment: 50, infrastructure: 50, technology: 50,
  agriculture: 50, international: 50, culture: 50,
  socialRights: 50, entrepreneurship: 50,
};

interface CamaraDeputado {
  id: number;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
  urlFoto: string;
}

interface CamaraListResponse<T> {
  dados: T[];
  links: { rel: string; href: string }[];
}

const PARTY_COLORS: Record<string, string> = {
  PT: "#CC0000", PL: "#003580", UNIÃO: "#002868", MDB: "#0D6EFD",
  PP: "#005EA6", PSD: "#009C3B", PSDB: "#006DB3", PSB: "#E8003D",
  PDT: "#006D77", REPUBLICANOS: "#0B6623", NOVO: "#FF6600", PSOL: "#FFCC00",
  AVANTE: "#1A7EC8", REDE: "#00A859", PODE: "#FF4B00", SOLIDARIEDADE: "#00B0F0",
  PCdoB: "#8B0000", PV: "#228B22", PRD: "#004080", PATRIOTA: "#006400",
  PTB: "#000080", PRTB: "#8B0000", DC: "#00529B", PMN: "#8B4513",
  PROS: "#E05D00", AGIR: "#FF8C00", CIDADANIA: "#0066CC",
};

const PARTY_IDEOLOGY: Record<string, PartyIdeology> = {
  PSOL: "far_left", PCdoB: "far_left", PT: "left", PDT: "left",
  PSB: "center_left", REDE: "center_left", AVANTE: "center_left",
  SOLIDARIEDADE: "center_left", PV: "center_left", PMN: "center_left",
  CIDADANIA: "center_left", MDB: "center", PSD: "center", PODE: "center",
  PRD: "center", AGIR: "center", PSDB: "center_right", PP: "center_right",
  REPUBLICANOS: "center_right", UNIÃO: "center_right", PROS: "center_right",
  PL: "right", NOVO: "right", PTB: "right", PRTB: "right", DC: "right",
  PATRIOTA: "right",
};

const PARTY_NAMES: Record<string, string> = {
  PT: "Partido dos Trabalhadores", PL: "Partido Liberal",
  UNIÃO: "União Brasil", MDB: "Movimento Democrático Brasileiro",
  PP: "Progressistas", PSD: "Partido Social Democrático",
  PSDB: "Partido da Social Democracia Brasileira", PSB: "Partido Socialista Brasileiro",
  PDT: "Partido Democrático Trabalhista", REPUBLICANOS: "Republicanos",
  NOVO: "Partido Novo", PSOL: "Partido Socialismo e Liberdade",
  AVANTE: "Avante", REDE: "Rede Sustentabilidade", PODE: "Podemos",
  SOLIDARIEDADE: "Solidariedade", PCdoB: "Partido Comunista do Brasil",
  PV: "Partido Verde", PRD: "Partido Renovação Democrática",
  PATRIOTA: "Patriota", PTB: "Partido Trabalhista Brasileiro",
  PRTB: "Partido Renovador Trabalhista Brasileiro", DC: "Democracia Cristã",
  PMN: "Partido da Mobilização Nacional", PROS: "Partido Republicano da Ordem Social",
  AGIR: "Agir", CIDADANIA: "Cidadania",
};

function toTitleCase(str: string): string {
  const lowers = new Set(["da", "de", "do", "das", "dos", "e", "em"]);
  return str
    .toLowerCase()
    .split(" ")
    .map((word, i) => (i === 0 || !lowers.has(word) ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function fetchDeputados(): Promise<CamaraDeputado[]> {
  const all: CamaraDeputado[] = [];
  let page = 1;

  while (true) {
    const url = `${CAMARA_BASE}/deputados?idLegislatura=${LEGISLATURA}&itens=100&pagina=${page}&ordem=ASC&ordenarPor=nome`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Câmara API error ${res.status}`);
    const data = await res.json() as CamaraListResponse<CamaraDeputado>;
    all.push(...data.dados);
    const hasNext = data.links.some((l) => l.rel === "next");
    if (!hasNext || data.dados.length === 0) break;
    page++;
    await new Promise((r) => setTimeout(r, 200));
  }

  return all;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

interface SeedPolitician {
  tseId: string;
  name: string;
  office: "president" | "governor";
  state?: string;
  party: string;
}

const OFFICE_TO_ROLE: Record<string, PoliticalRole> = {
  president:      "president",
  governor:       "governor",
  senator:        "senator",
  federal_deputy: "federal_deputy",
  state_deputy:   "state_deputy",
};

/** Brazilian governors — 2023-2027 mandate */
const GOVERNORS_SEED: SeedPolitician[] = [
  { tseId: "gov-ac", name: "Gladson Cameli",             office: "governor", state: "AC", party: "PP" },
  { tseId: "gov-al", name: "Paulo Dantas",                office: "governor", state: "AL", party: "MDB" },
  { tseId: "gov-am", name: "Wilson Lima",                 office: "governor", state: "AM", party: "UNIÃO" },
  { tseId: "gov-ap", name: "Clécio Luís",                 office: "governor", state: "AP", party: "SOLIDARIEDADE" },
  { tseId: "gov-ba", name: "Jerônimo Rodrigues",          office: "governor", state: "BA", party: "PT" },
  { tseId: "gov-ce", name: "Elmano de Freitas",           office: "governor", state: "CE", party: "PT" },
  { tseId: "gov-df", name: "Ibaneis Rocha",               office: "governor", state: "DF", party: "MDB" },
  { tseId: "gov-es", name: "Renato Casagrande",           office: "governor", state: "ES", party: "PSB" },
  { tseId: "gov-go", name: "Ronaldo Caiado",              office: "governor", state: "GO", party: "UNIÃO" },
  { tseId: "gov-ma", name: "Carlos Brandão",              office: "governor", state: "MA", party: "PSB" },
  { tseId: "gov-mg", name: "Romeu Zema",                  office: "governor", state: "MG", party: "NOVO" },
  { tseId: "gov-ms", name: "Eduardo Riedel",              office: "governor", state: "MS", party: "PSDB" },
  { tseId: "gov-mt", name: "Mauro Mendes",                office: "governor", state: "MT", party: "UNIÃO" },
  { tseId: "gov-pa", name: "Helder Barbalho",             office: "governor", state: "PA", party: "MDB" },
  { tseId: "gov-pb", name: "João Azevêdo",                office: "governor", state: "PB", party: "PSB" },
  { tseId: "gov-pe", name: "Raquel Lyra",                 office: "governor", state: "PE", party: "PSDB" },
  { tseId: "gov-pi", name: "Rafael Fonteles",             office: "governor", state: "PI", party: "PT" },
  { tseId: "gov-pr", name: "Carlos Massa Ratinho Junior", office: "governor", state: "PR", party: "PSD" },
  { tseId: "gov-rj", name: "Cláudio Castro",              office: "governor", state: "RJ", party: "PL" },
  { tseId: "gov-rn", name: "Fátima Bezerra",              office: "governor", state: "RN", party: "PT" },
  { tseId: "gov-ro", name: "Marcos Rocha",                office: "governor", state: "RO", party: "UNIÃO" },
  { tseId: "gov-rr", name: "Arthur Henrique",             office: "governor", state: "RR", party: "MDB" },
  { tseId: "gov-rs", name: "Eduardo Leite",               office: "governor", state: "RS", party: "PSDB" },
  { tseId: "gov-sc", name: "Jorginho Mello",              office: "governor", state: "SC", party: "PL" },
  { tseId: "gov-se", name: "Fábio Mitidieri",             office: "governor", state: "SE", party: "PSD" },
  { tseId: "gov-sp", name: "Tarcísio de Freitas",         office: "governor", state: "SP", party: "REPUBLICANOS" },
  { tseId: "gov-to", name: "Wanderlei Barbosa",           office: "governor", state: "TO", party: "REPUBLICANOS" },
];

/** Main presidential candidates — 2022 election */
const PRESIDENTS_SEED: SeedPolitician[] = [
  { tseId: "pres-001", name: "Luiz Inácio Lula da Silva", office: "president", party: "PT" },
  { tseId: "pres-002", name: "Jair Messias Bolsonaro",    office: "president", party: "PL" },
  { tseId: "pres-003", name: "Ciro Gomes",                office: "president", party: "PDT" },
  { tseId: "pres-004", name: "Simone Tebet",              office: "president", party: "MDB" },
  { tseId: "pres-005", name: "Soraya Thronicke",          office: "president", party: "UNIÃO" },
];

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly camaraApiService: CamaraApiService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  // ─── Shared helpers ─────────────────────────────────────────────────────────

  private async upsertPartiesFromSeed(seeds: SeedPolitician[]): Promise<Map<string, string>> {
    const partySiglas = [...new Set(seeds.map((s) => s.party))];
    const partyMap = new Map<string, string>();
    for (const sigla of partySiglas) {
      const party = await this.prisma.party.upsert({
        where: { acronym: sigla },
        update: {},
        create: {
          acronym:   sigla,
          name:      PARTY_NAMES[sigla] ?? sigla,
          colorHex:  PARTY_COLORS[sigla] ?? "#666666",
          ideology:  PARTY_IDEOLOGY[sigla] ?? "center",
        },
      });
      partyMap.set(sigla, party.id);
    }
    return partyMap;
  }

  private async upsertSeedPolitician(
    seed: SeedPolitician,
    partyId: string,
  ): Promise<void> {
    const politician = await this.prisma.politician.upsert({
      where: { tseId: seed.tseId },
      update: { name: seed.name, state: seed.state ?? null, partyId },
      create: {
        tseId:    seed.tseId,
        name:     seed.name,
        slug:     slugify(seed.name),
        office:   seed.office,
        state:    seed.state ?? null,
        partyId,
      },
    });
    const scoreNum = seed.tseId.split("-").reduce((acc, part) => acc + part.charCodeAt(0), 0);
    const role     = OFFICE_TO_ROLE[seed.office] ?? "federal_deputy";
    const { breakdown, penalties, ...scoreFields } = calculateScoreFromMock(scoreNum % 100_000, role);
    const jsonScores = {
      ...scoreFields,
      breakdown: breakdown as unknown as Prisma.InputJsonValue,
      penalties: penalties as unknown as Prisma.InputJsonValue,
    };
    await this.prisma.score.upsert({
      where:  { politicianId: politician.id },
      update: jsonScores,
      create: { politicianId: politician.id, ...jsonScores },
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
    // Invalida o cache após sync para que novas queries reflitam os scores atualizados
    await (this.cache as unknown as { reset(): Promise<void> }).reset();
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
    // Invalida o cache após sync para que novas queries reflitam os scores atualizados
    await (this.cache as unknown as { reset(): Promise<void> }).reset();
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
      const normalized: Prisma.PartyCreateInput = {
        acronym: sigla,
        name: PARTY_NAMES[sigla] ?? sigla,
        colorHex: PARTY_COLORS[sigla] ?? "#666666",
        ideology: PARTY_IDEOLOGY[sigla] ?? "center",
      };
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

      const name = toTitleCase(dep.nome);
      const slug = slugify(dep.nome);

      const politician = await this.prisma.politician.upsert({
        where: { tseId: String(dep.id) },
        update: { name, slug, photoUrl: dep.urlFoto, state: dep.siglaUf, partyId },
        create: {
          tseId: String(dep.id),
          name,
          slug,
          office: "federal_deputy",
          state: dep.siglaUf,
          photoUrl: dep.urlFoto,
          partyId,
        },
      });

      // Busca dados reais da Câmara API com fallback para mock se falhar
      let scoreInput: RawScoreInput | null = null;
      try {
        const [votacoes, proposicoes, publicouDespesas] = await Promise.all([
          this.camaraApiService.getVotacoes(String(dep.id)),
          this.camaraApiService.getProposicoes(String(dep.id)),
          this.camaraApiService.getPublicouDespesas(String(dep.id)),
        ]);

        const presenceVotos = votacoes.filter(
          (v) => ["Sim", "Não", "Abstenção", "Obstrução"].includes(v.tipoVoto),
        ).length;

        scoreInput = {
          role: "federal_deputy",
          integrity: NEUTRAL_INTEGRITY,
          transparency: {
            cguTransparencyScore: 5,
            patrimonyDeclared: true,
            spendingPublishedRate: publicouDespesas ? 90 : 30,
            publicMeetingsRate: 50,
            openDataCompliance: 5,
          },
          legislative: {
            presenceRate: Math.min(100, Math.round((presenceVotos / 150) * 100)),
            billsProposed: proposicoes.proposed,
            billsApproved: proposicoes.approved,
            committeeParticipation: 50,
            discourseVoteConsistency: 50,
          },
          fiscal: NEUTRAL_FISCAL,
          constitutional: NEUTRAL_CONSTITUTIONAL,
          thematic: NEUTRAL_THEMATIC,
        };
      } catch {
        this.logger.warn(`Câmara API failed for deputado ${dep.id} — using mock score`);
      }

      const scoreResult = scoreInput
        ? calculateScore(scoreInput)
        : calculateScoreFromMock(dep.id, "federal_deputy");

      const { breakdown, penalties, ...scoreFields } = scoreResult;
      const jsonScores = {
        ...scoreFields,
        breakdown: breakdown as unknown as Prisma.InputJsonValue,
        penalties: penalties as unknown as Prisma.InputJsonValue,
      };
      await this.prisma.score.upsert({
        where: { politicianId: politician.id },
        update: jsonScores,
        create: { politicianId: politician.id, ...jsonScores },
      });

      synced++;
    }

    this.logger.log(`Sync complete: ${synced} synced, ${skipped} skipped`);
    // Invalida o cache após sync para que novas queries reflitam os scores atualizados
    await (this.cache as unknown as { reset(): Promise<void> }).reset();
    return { synced, skipped };
  }
}
