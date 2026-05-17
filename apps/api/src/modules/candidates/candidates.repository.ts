import { Injectable } from "@nestjs/common";
import type { Office, Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";
import type { CreateCandidateDto } from "./dto/create-candidate.dto";

const candidateSelect = {
  id: true,
  name: true,
  slug: true,
  office: true,
  state: true,
  photoUrl: true,
  bio: true,
  tseId: true,
  createdAt: true,
  updatedAt: true,
  party: { select: { id: true, name: true, acronym: true, colorHex: true, logoUrl: true } },
  score: true,
} as const satisfies Prisma.CandidateSelect;

export type CandidateResult = Prisma.CandidateGetPayload<{ select: typeof candidateSelect }>;

export interface CandidateFilters {
  office?: Office;
  state?: string;
  party?: string;
  search?: string;
}

@Injectable()
export class CandidatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filters: CandidateFilters): Prisma.CandidateWhereInput {
    return {
      ...(filters.office && { office: filters.office }),
      ...(filters.state && { state: { equals: filters.state.toUpperCase(), mode: "insensitive" } }),
      ...(filters.party && { party: { acronym: { equals: filters.party.toUpperCase(), mode: "insensitive" } } }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { party: { name: { contains: filters.search, mode: "insensitive" } } },
          { party: { acronym: { contains: filters.search, mode: "insensitive" } } },
        ],
      }),
    };
  }

  count(filters: CandidateFilters): Promise<number> {
    return this.prisma.candidate.count({ where: this.buildWhere(filters) });
  }

  findAll(filters: CandidateFilters, skip: number, take: number): Promise<CandidateResult[]> {
    return this.prisma.candidate.findMany({
      where: this.buildWhere(filters),
      select: candidateSelect,
      orderBy: [{ score: { overall: "desc" } }, { name: "asc" }],
      skip,
      take,
    });
  }

  findBySlug(slug: string): Promise<CandidateResult | null> {
    return this.prisma.candidate.findUnique({ where: { slug }, select: candidateSelect });
  }

  findById(id: string): Promise<CandidateResult | null> {
    return this.prisma.candidate.findUnique({ where: { id }, select: candidateSelect });
  }

  create(slug: string, dto: CreateCandidateDto): Promise<CandidateResult> {
    return this.prisma.candidate.create({ data: { slug, ...dto }, select: candidateSelect });
  }

  findAllWithScores(): Promise<CandidateResult[]> {
    return this.prisma.candidate.findMany({
      where: { score: { isNot: null } },
      select: candidateSelect,
      orderBy: { score: { overall: "desc" } },
    });
  }

  update(id: string, data: Partial<CreateCandidateDto>): Promise<CandidateResult> {
    return this.prisma.candidate.update({ where: { id }, data, select: candidateSelect });
  }
}
