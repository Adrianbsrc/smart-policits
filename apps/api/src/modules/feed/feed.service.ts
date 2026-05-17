import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import type { FeedItemType, Prisma } from "@smart-politics/db";

import { paginate, type PaginatedResponse } from "../../common/dto/pagination.dto";
import { PrismaService } from "../../config/prisma.service";
import type { CreateFeedItemDto } from "./dto/create-feed-item.dto";
import type { UpdateFeedItemDto } from "./dto/update-feed-item.dto";

const SPOTLIGHT_LIMIT = 40;

const spotlightSelect = {
  id: true,
  name: true,
  slug: true,
  office: true,
  state: true,
  photoUrl: true,
  party: { select: { acronym: true, colorHex: true, name: true } },
  score: {
    select: {
      overall: true,
      integrityMultiplier: true,
      penalties: true,
      transparency: true,
      activity: true,
      fiscal: true,
      constitutional: true,
      education: true,
      health: true,
      security: true,
      economy: true,
      environment: true,
      infrastructure: true,
      technology: true,
      agriculture: true,
      international: true,
      culture: true,
      socialRights: true,
      entrepreneurship: true,
    },
  },
} as const satisfies Prisma.PoliticianSelect;

type SpotlightPolitician = Prisma.PoliticianGetPayload<{ select: typeof spotlightSelect }>;

const THEMATIC_KEYS = [
  "education", "health", "security", "economy", "environment",
  "infrastructure", "technology", "agriculture", "international",
  "culture", "socialRights", "entrepreneurship",
] as const;

type ThematicKey = typeof THEMATIC_KEYS[number];

const THEMATIC_LABELS: Record<ThematicKey, string> = {
  education: "Educação", health: "Saúde", security: "Segurança",
  economy: "Economia", environment: "Meio Ambiente", infrastructure: "Infraestrutura",
  technology: "Tecnologia", agriculture: "Agropecuária", international: "Relações Internacionais",
  culture: "Cultura", socialRights: "Direitos Sociais", entrepreneurship: "Empreendedorismo",
};

function getTopAndWorstDimension(score: SpotlightPolitician["score"]): { top: string; worst: string } {
  if (!score) return { top: "—", worst: "—" };
  let topKey: ThematicKey = "education";
  let worstKey: ThematicKey = "education";
  let topVal = -Infinity;
  let worstVal = Infinity;
  for (const key of THEMATIC_KEYS) {
    const val = score[key] as number;
    if (val > topVal) { topVal = val; topKey = key; }
    if (val < worstVal) { worstVal = val; worstKey = key; }
  }
  return { top: THEMATIC_LABELS[topKey], worst: THEMATIC_LABELS[worstKey] };
}

export interface SpotlightCard {
  id: string;
  type: "politician_spotlight";
  title: string;
  summary: string;
  imageUrl: string | null;
  ctaLabel: string;
  ctaUrl: string;
  metadata: {
    overall: number;
    integrityMultiplier: number;
    penalties: unknown;
    topDimension: string;
    worstDimension: string;
    office: string;
    partyAcronym: string | null;
    partyColorHex: string | null;
  };
  publishedAt: string;
  politicianId: string;
  politician: { name: string; slug: string; photoUrl: string | null };
}

export interface StaticFeedCard {
  id: string;
  type: "news" | "law_update" | "poll" | "generic";
  title: string;
  summary: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  metadata: Record<string, unknown>;
  publishedAt: string;
  politicianId: string | null;
  politician: { name: string; slug: string; photoUrl: string | null } | null;
}

export type FeedCard = SpotlightCard | StaticFeedCard;

function toSpotlightCard(p: SpotlightPolitician): SpotlightCard {
  const { top, worst } = getTopAndWorstDimension(p.score);
  return {
    id: `spotlight_${p.id}`,
    type: "politician_spotlight",
    title: p.name,
    summary: `${p.office} · ${p.state ?? "Brasil"}`,
    imageUrl: p.photoUrl ?? null,
    ctaLabel: "Ver perfil completo",
    ctaUrl: `/perfil/${p.slug}`,
    metadata: {
      overall: p.score?.overall ?? 0,
      integrityMultiplier: p.score?.integrityMultiplier ?? 1,
      penalties: p.score?.penalties ?? [],
      topDimension: top,
      worstDimension: worst,
      office: p.office,
      partyAcronym: p.party?.acronym ?? null,
      partyColorHex: p.party?.colorHex ?? null,
    },
    publishedAt: new Date().toISOString(),
    politicianId: p.id,
    politician: { name: p.name, slug: p.slug, photoUrl: p.photoUrl },
  };
}

type FeedItemWithPolitician = Prisma.FeedItemGetPayload<{
  include: { politician: { select: { name: true; slug: true; photoUrl: true } } };
}>;

function toStaticCard(item: FeedItemWithPolitician): StaticFeedCard {
  return {
    id: item.id,
    type: item.type as StaticFeedCard["type"],
    title: item.title,
    summary: item.summary,
    imageUrl: item.imageUrl,
    ctaLabel: item.ctaLabel,
    ctaUrl: item.ctaUrl,
    metadata: item.metadata as Record<string, unknown>,
    publishedAt: item.publishedAt.toISOString(),
    politicianId: item.politicianId,
    politician: item.politician ?? null,
  };
}

function interleaveCards(spotlights: SpotlightCard[], statics: StaticFeedCard[]): FeedCard[] {
  const result: FeedCard[] = [];
  let si = 0;
  for (let i = 0; i < spotlights.length; i++) {
    result.push(spotlights[i]);
    // Insert a static card every 3 spotlights
    if ((i + 1) % 3 === 0 && si < statics.length) {
      result.push(statics[si++]);
    }
  }
  while (si < statics.length) {
    result.push(statics[si++]);
  }
  return result;
}

@Injectable()
export class FeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    const count = await this.prisma.feedItem.count();
    if (count === 0) {
      await this.seedInitialItems();
    }
  }

  async getFeed(page: number, limit: number): Promise<PaginatedResponse<FeedCard>> {
    const skip = (page - 1) * limit;

    const [politicians, staticItems] = await Promise.all([
      this.prisma.politician.findMany({
        where: { score: { isNot: null } },
        select: spotlightSelect,
        orderBy: { score: { overall: "desc" } },
        take: SPOTLIGHT_LIMIT,
      }),
      this.prisma.feedItem.findMany({
        where: {
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: { politician: { select: { name: true, slug: true, photoUrl: true } } },
        orderBy: { publishedAt: "desc" },
      }),
    ]);

    const spotlights = politicians.map(toSpotlightCard);
    const statics = staticItems.map(toStaticCard);
    const merged = interleaveCards(spotlights, statics);

    const total = merged.length;
    const paginated = merged.slice(skip, skip + limit);

    return paginate(paginated, total, page, limit);
  }

  async createFeedItem(dto: CreateFeedItemDto): Promise<StaticFeedCard> {
    const item = await this.prisma.feedItem.create({
      data: {
        type: dto.type as FeedItemType,
        title: dto.title,
        summary: dto.summary,
        imageUrl: dto.imageUrl,
        ctaLabel: dto.ctaLabel,
        ctaUrl: dto.ctaUrl,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        active: dto.active ?? true,
        politicianId: dto.politicianId,
      },
      include: { politician: { select: { name: true, slug: true, photoUrl: true } } },
    }) as FeedItemWithPolitician;
    return toStaticCard(item);
  }

  async updateFeedItem(id: string, dto: UpdateFeedItemDto): Promise<StaticFeedCard> {
    const existing = await this.prisma.feedItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Feed item ${id} não encontrado`);

    const updateData: Prisma.FeedItemUpdateInput = {
      ...(dto.type !== undefined && { type: dto.type as FeedItemType }),
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.summary !== undefined && { summary: dto.summary }),
      ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      ...(dto.ctaLabel !== undefined && { ctaLabel: dto.ctaLabel }),
      ...(dto.ctaUrl !== undefined && { ctaUrl: dto.ctaUrl }),
      ...(dto.metadata !== undefined && { metadata: dto.metadata as Prisma.InputJsonValue }),
      ...(dto.publishedAt !== undefined && { publishedAt: new Date(dto.publishedAt) }),
      ...(dto.expiresAt !== undefined && { expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null }),
      ...(dto.active !== undefined && { active: dto.active }),
      ...(dto.politicianId !== undefined && {
        politician: dto.politicianId
          ? { connect: { id: dto.politicianId } }
          : { disconnect: true },
      }),
    };

    const item = await this.prisma.feedItem.update({
      where: { id },
      data: updateData,
      include: { politician: { select: { name: true, slug: true, photoUrl: true } } },
    }) as FeedItemWithPolitician;
    return toStaticCard(item);
  }

  async deleteFeedItem(id: string): Promise<void> {
    const existing = await this.prisma.feedItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Feed item ${id} não encontrado`);
    await this.prisma.feedItem.delete({ where: { id } });
  }

  async listFeedItems(page: number, limit: number): Promise<PaginatedResponse<StaticFeedCard>> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.feedItem.findMany({
        skip,
        take: limit,
        include: { politician: { select: { name: true, slug: true, photoUrl: true } } },
        orderBy: { publishedAt: "desc" },
      }),
      this.prisma.feedItem.count(),
    ]);
    return paginate(items.map(toStaticCard), total, page, limit);
  }

  private async seedInitialItems(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = (v: Record<string, unknown>): Prisma.InputJsonValue => v as any;

    const items: Prisma.FeedItemCreateManyInput[] = [
      // --- news ---
      {
        type: "news",
        title: "Câmara aprova projeto que amplia acesso à educação digital",
        summary: "Por 312 votos a 45, deputados aprovaram o PL 1234/2024 que garante conectividade em escolas públicas até 2026.",
        ctaLabel: "Ler mais",
        ctaUrl: "https://camara.leg.br",
        metadata: m({ source: "Câmara dos Deputados", tags: ["educação", "tecnologia"] }),
        publishedAt: new Date("2026-05-15"),
      },
      {
        type: "news",
        title: "Senado avança na votação da reforma tributária simplificada",
        summary: "Sessão extraordinária debate texto final do projeto que unifica tributos federais sobre consumo.",
        ctaLabel: "Ler mais",
        ctaUrl: "https://senado.leg.br",
        metadata: m({ source: "Senado Federal", tags: ["economia", "tributação"] }),
        publishedAt: new Date("2026-05-14"),
      },
      {
        type: "news",
        title: "TCU identifica irregularidades em contratos de obras do DNIT",
        summary: "Auditoria aponta sobrepreço de R$ 480 milhões em 23 contratos de rodovias federais nos últimos 3 anos.",
        ctaLabel: "Ver relatório",
        ctaUrl: "https://portal.tcu.gov.br",
        metadata: m({ source: "TCU", tags: ["fiscalização", "obras"] }),
        publishedAt: new Date("2026-05-13"),
      },
      // --- law_update ---
      {
        type: "law_update",
        title: "PL 789/2024 — Lei Geral de Proteção de Dados Públicos",
        summary: "Votação encerrada: projeto aprovado com ampla maioria para ampliar transparência nos dados governamentais.",
        metadata: m({
          billId: "PL 789/2024",
          billTitle: "Lei Geral de Proteção de Dados Públicos",
          votesFor: 287,
          votesAgainst: 78,
          totalVotes: 365,
          status: "approved",
        }),
        publishedAt: new Date("2026-05-10"),
      },
      {
        type: "law_update",
        title: "PL 456/2024 — Regulamentação das Inteligências Artificiais",
        summary: "Em votação: marco regulatório para uso de IA pelo setor público e privado.",
        metadata: m({
          billId: "PL 456/2024",
          billTitle: "Regulamentação das Inteligências Artificiais",
          votesFor: 142,
          votesAgainst: 189,
          totalVotes: 331,
          status: "pending",
        }),
        publishedAt: new Date("2026-05-08"),
      },
      {
        type: "law_update",
        title: "PEC 12/2023 — Reforma do Sistema Previdenciário Estadual",
        summary: "Proposta rejeitada por não atingir o quórum mínimo de 2/3 dos votos necessários.",
        metadata: m({
          billId: "PEC 12/2023",
          billTitle: "Reforma do Sistema Previdenciário Estadual",
          votesFor: 298,
          votesAgainst: 167,
          totalVotes: 465,
          status: "rejected",
        }),
        publishedAt: new Date("2026-05-05"),
      },
      // --- poll ---
      {
        type: "poll",
        title: "Qual tema deve ser prioridade na próxima eleição?",
        summary: "Participe da enquete semanal do Smart Politics. Seus dados são anônimos.",
        metadata: m({
          question: "Qual tema deve ser prioridade na próxima eleição?",
          options: [
            { label: "Saúde pública", votes: 4523 },
            { label: "Educação básica", votes: 3876 },
            { label: "Segurança pública", votes: 2943 },
            { label: "Economia e emprego", votes: 5102 },
          ],
          totalVotes: 16444,
        }),
        publishedAt: new Date("2026-05-12"),
      },
      {
        type: "poll",
        title: "Você confia nas informações divulgadas pelo governo?",
        summary: "Transparência e comunicação pública em debate.",
        metadata: m({
          question: "Você confia nas informações divulgadas pelo governo?",
          options: [
            { label: "Sim, plenamente", votes: 892 },
            { label: "Parcialmente", votes: 3456 },
            { label: "Raramente", votes: 2789 },
            { label: "Não confio", votes: 4123 },
          ],
          totalVotes: 11260,
        }),
        publishedAt: new Date("2026-05-07"),
      },
      // --- generic ---
      {
        type: "generic",
        title: "Como funciona nossa metodologia de avaliação?",
        summary: "Entenda o Score 2.0: pilares estruturais, multiplicador de integridade e as 12 dimensões temáticas.",
        ctaLabel: "Ver metodologia",
        ctaUrl: "/metodologia",
        metadata: m({ tags: ["metodologia", "transparência"], color: "#3b82f6", icon: "BookOpen" }),
        publishedAt: new Date("2026-05-11"),
      },
      {
        type: "generic",
        title: "Comparador de políticos: encontre quem mais representa você",
        summary: "Compare até dois perfis lado a lado: scores, partido, votações e muito mais.",
        ctaLabel: "Comparar agora",
        ctaUrl: "/comparar",
        metadata: m({ tags: ["ferramenta", "comparação"], color: "#8b5cf6", icon: "GitCompare" }),
        publishedAt: new Date("2026-05-09"),
      },
      {
        type: "generic",
        title: "Faça o quiz e descubra seu perfil eleitoral",
        summary: "15 perguntas para mapear suas prioridades e encontrar os políticos com maior alinhamento com você.",
        ctaLabel: "Fazer o quiz",
        ctaUrl: "/quiz",
        metadata: m({ tags: ["quiz", "match"], color: "#059669", icon: "BarChart3" }),
        publishedAt: new Date("2026-05-06"),
      },
    ];

    await this.prisma.feedItem.createMany({ data: items });
  }
}
