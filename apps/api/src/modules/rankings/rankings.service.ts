import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { paginate, type PaginatedResponse } from "../../common/dto/pagination.dto";
import { PrismaService } from "../../config/prisma.service";
import type { ListRankingsDto } from "./dto/list-rankings.dto";

const SCORE_SELECT = {
  overall: true,
  scoreType: true,
  education: true,
  health: true,
  security: true,
  economy: true,
  transparency: true,
  environment: true,
  infrastructure: true,
  technology: true,
  agriculture: true,
  international: true,
  culture: true,
  socialRights: true,
  entrepreneurship: true,
  activity: true,
  fiscal: true,
  constitutional: true,
  integrityMultiplier: true,
  penalties: true,
  breakdown: true,
  scoreVersion: true,
} as const satisfies Prisma.ScoreSelect;

@Injectable()
export class RankingsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(dto: ListRankingsDto): Prisma.PoliticianWhereInput {
    return {
      // Exige score com dado real (overall > 0 = ao menos um campo foi preenchido pelo ETL).
      // Politicians com overall = 0 não tiveram sync completo ainda — não aparecem no ranking.
      // `is: { overall: { gt: 0 } }` implicitamente exclui null também.
      score: { is: { overall: { gt: 0 } } },

      // office[] — OR entre os valores (ex: Câmara + Senado)
      ...(dto.office?.length && { office: { in: dto.office } }),

      ...(dto.state?.length && { state: { in: dto.state.map((s) => s.toUpperCase()) } }),
      ...(dto.party?.length && { party: { acronym: { in: dto.party.map((p) => p.toUpperCase()) } } }),

      ...(dto.fichaLimpa   && { fichaLimpaIneligible: false }),
      ...(dto.preCandidate && { isPreCandidate: true }),

      // Filtros por contagem de mandatos — requerem mandateCount preenchido via ETL
      ...(dto.estreante    && { mandateCount: { lte: 1 } }),
      ...(dto.reeleito     && { mandateCount: { gte: 2 } }),
      ...(dto.veterano     && { mandateCount: { gte: 3 } }),

      ...(dto.search && {
        OR: [
          { name: { contains: dto.search, mode: "insensitive" } },
          { party: { acronym: { contains: dto.search, mode: "insensitive" } } },
        ],
      }),
    };
  }

  private buildOrderBy(sortBy?: string): Prisma.PoliticianOrderByWithRelationInput {
    const allowed = ["overall", "transparency", "activity", "constitutional", "integrityMultiplier"];
    const safe = sortBy && allowed.includes(sortBy) ? sortBy : "overall";
    return { score: { [safe]: "desc" } };
  }

  async getRanking(dto: ListRankingsDto): Promise<PaginatedResponse<Record<string, unknown>>> {
    const { page, limit } = dto;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(dto);

    const [politicians, total] = await Promise.all([
      this.prisma.politician.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          office: true,
          state: true,
          photoUrl: true,
          fichaLimpaIneligible: true,
          candidateNumber: true,
          mandateCount: true,
          party: { select: { acronym: true, colorHex: true, name: true } },
          score: { select: SCORE_SELECT },
        },
        orderBy: this.buildOrderBy(dto.sortBy),
        skip,
        take: limit,
      }),
      this.prisma.politician.count({ where }),
    ]);

    const ranked = politicians.map((p, i) => ({ rank: skip + i + 1, ...p }));
    return paginate(ranked, total, page, limit);
  }
}
