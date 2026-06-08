import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { slugify } from "@smart-politics/core";
import { fetchVotacoes } from "@smart-politics/etl";
import type { Prisma } from "@smart-politics/db";

import { paginate, type PaginatedResponse } from "../../common/dto/pagination.dto";
import type { PoliticianFilters, PoliticianResult } from "./politicians.repository";
import { PoliticiansRepository } from "./politicians.repository";
import type { CreatePoliticianDto } from "./dto/create-politician.dto";
import type { ListPoliticiansDto } from "./dto/list-politicians.dto";
import { PrismaService } from "../../config/prisma.service";

const SCORE_HISTORY_SELECT = {
  id: true,
  overall: true,
  activity: true,
  transparency: true,
  fiscal: true,
  constitutional: true,
  integrityMultiplier: true,
  scoreType: true,
  trigger: true,
  snapshotAt: true,
} as const satisfies Prisma.ScoreHistorySelect;

const SCORE_EVIDENCE_SELECT = {
  id: true,
  dimension: true,
  explanation: true,
  deltaValue: true,
  createdAt: true,
  event: {
    select: {
      id: true,
      title: true,
      eventDate: true,
      type: true,
      sourceUrl: true,
    },
  },
} as const satisfies Prisma.ScoreEvidenceSelect;

export type ScoreHistoryItem = Prisma.ScoreHistoryGetPayload<{ select: typeof SCORE_HISTORY_SELECT }>;
export type ScoreEvidenceItem = Prisma.ScoreEvidenceGetPayload<{ select: typeof SCORE_EVIDENCE_SELECT }>;

@Injectable()
export class PoliticiansService {
  constructor(
    private readonly politiciansRepository: PoliticiansRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: ListPoliticiansDto): Promise<PaginatedResponse<PoliticianResult>> {
    const { page, limit, office, state, party, search } = query;
    const filters: PoliticianFilters = { office, state, party, search };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.politiciansRepository.findAll(filters, skip, limit),
      this.politiciansRepository.count(filters),
    ]);

    return paginate(data, total, page, limit);
  }

  async findByIdOrThrow(id: string): Promise<PoliticianResult> {
    const politician = await this.politiciansRepository.findById(id);
    if (!politician) throw new NotFoundException(`Político ${id} não encontrado`);
    return politician;
  }

  async findBySlugOrThrow(slug: string): Promise<PoliticianResult> {
    const politician = await this.politiciansRepository.findBySlug(slug);
    if (!politician) throw new NotFoundException(`Político "${slug}" não encontrado`);
    return politician;
  }

  async create(dto: CreatePoliticianDto): Promise<PoliticianResult> {
    const slug = slugify(dto.name);
    const existing = await this.politiciansRepository.findBySlug(slug);
    if (existing) throw new ConflictException(`Político com slug "${slug}" já existe`);
    return this.politiciansRepository.create(slug, dto);
  }

  findAllWithScores(): Promise<PoliticianResult[]> {
    return this.politiciansRepository.findAllWithScores();
  }

  async update(id: string, dto: Partial<CreatePoliticianDto>): Promise<PoliticianResult> {
    const politician = await this.politiciansRepository.findById(id);
    if (!politician) throw new NotFoundException(`Político ${id} não encontrado`);
    return this.politiciansRepository.update(id, dto);
  }

  async getCamaraVotacoes(slug: string): Promise<{ dados: unknown[] }> {
    const politician = await this.politiciansRepository.findBySlug(slug);
    if (!politician) throw new NotFoundException(`Político "${slug}" não encontrado`);
    if (politician.office !== "federal_deputy" || !politician.tseId || !/^\d+$/.test(politician.tseId)) {
      return { dados: [] };
    }
    const votacoes = await fetchVotacoes(Number(politician.tseId), 150);
    return { dados: votacoes };
  }

  async getScoreHistory(slug: string, limit: number): Promise<ScoreHistoryItem[]> {
    const politician = await this.politiciansRepository.findBySlug(slug);
    if (!politician) throw new NotFoundException(`Político "${slug}" não encontrado`);

    return this.prisma.scoreHistory.findMany({
      where: { politicianId: politician.id },
      select: SCORE_HISTORY_SELECT,
      orderBy: { snapshotAt: "desc" },
      take: Math.min(limit, 365),
    });
  }

  async getScoreEvidence(
    slug: string,
    dimension: string | undefined,
    limit: number,
  ): Promise<ScoreEvidenceItem[]> {
    const politician = await this.politiciansRepository.findBySlug(slug);
    if (!politician) throw new NotFoundException(`Político "${slug}" não encontrado`);

    return this.prisma.scoreEvidence.findMany({
      where: {
        politicianId: politician.id,
        ...(dimension ? { dimension } : {}),
      },
      select: SCORE_EVIDENCE_SELECT,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });
  }
}
