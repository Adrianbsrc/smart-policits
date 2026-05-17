import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { paginate } from "../../common/dto/pagination.dto";
import { PrismaService } from "../../config/prisma.service";
import type { ListRankingsDto } from "./dto/list-rankings.dto";

@Injectable()
export class RankingsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(dto: ListRankingsDto): Prisma.CandidateWhereInput {
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

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
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
            },
          },
        },
        orderBy: { score: { overall: "desc" } },
        skip,
        take: limit,
      }),
      this.prisma.candidate.count({ where }),
    ]);

    const ranked = candidates.map((c, i) => ({ rank: skip + i + 1, ...c }));
    return paginate(ranked, total, page, limit);
  }
}
