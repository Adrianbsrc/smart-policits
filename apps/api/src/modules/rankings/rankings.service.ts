import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { paginate } from "../../common/dto/pagination.dto";
import { PrismaService } from "../../config/prisma.service";
import type { ListRankingsDto } from "./dto/list-rankings.dto";

@Injectable()
export class RankingsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(dto: ListRankingsDto): Prisma.PoliticianWhereInput {
    return {
      score: { isNot: null },
      ...(dto.office && { office: dto.office }),
      ...(dto.state && { state: { equals: dto.state.toUpperCase(), mode: "insensitive" } }),
      ...(dto.party && { party: { acronym: { equals: dto.party.toUpperCase(), mode: "insensitive" } } }),
      ...(dto.search && {
        OR: [
          { name: { contains: dto.search, mode: "insensitive" } },
          { party: { acronym: { contains: dto.search, mode: "insensitive" } } },
        ],
      }),
    };
  }

  async getRanking(dto: ListRankingsDto) {
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
          party: { select: { acronym: true, colorHex: true, name: true } },
          score: {
            select: {
              overall: true,
              education: true,
              health: true,
              security: true,
              economy: true,
              transparency: true,
              integrityMultiplier: true,
              activity: true,
            },
          },
        },
        orderBy: { score: { overall: "desc" } },
        skip,
        take: limit,
      }),
      this.prisma.politician.count({ where }),
    ]);

    const ranked = politicians.map((p, i) => ({ rank: skip + i + 1, ...p }));
    return paginate(ranked, total, page, limit);
  }
}
