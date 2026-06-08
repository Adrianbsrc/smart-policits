import { Injectable } from "@nestjs/common";
import type { Office, Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";
import type { CreatePoliticianDto } from "./dto/create-politician.dto";

const politicianSelect = {
  id: true,
  name: true,
  slug: true,
  office: true,
  state: true,
  photoUrl: true,
  bio: true,
  tseId: true,
  candidateNumber: true,
  fichaLimpaIneligible: true,
  isPreCandidate: true,
  candidateYear: true,
  createdAt: true,
  updatedAt: true,
  party: { select: { id: true, name: true, acronym: true, colorHex: true, logoUrl: true } },
  score: true,
} as const satisfies Prisma.PoliticianSelect;

export type PoliticianResult = Prisma.PoliticianGetPayload<{ select: typeof politicianSelect }>;

export interface PoliticianFilters {
  office?: Office;
  state?: string;
  party?: string;
  search?: string;
}

@Injectable()
export class PoliticiansRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filters: PoliticianFilters): Prisma.PoliticianWhereInput {
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

  count(filters: PoliticianFilters): Promise<number> {
    return this.prisma.politician.count({ where: this.buildWhere(filters) });
  }

  findAll(filters: PoliticianFilters, skip: number, take: number): Promise<PoliticianResult[]> {
    return this.prisma.politician.findMany({
      where: this.buildWhere(filters),
      select: politicianSelect,
      orderBy: [{ score: { overall: "desc" } }, { name: "asc" }],
      skip,
      take,
    });
  }

  findBySlug(slug: string): Promise<PoliticianResult | null> {
    return this.prisma.politician.findUnique({ where: { slug }, select: politicianSelect });
  }

  findById(id: string): Promise<PoliticianResult | null> {
    return this.prisma.politician.findUnique({ where: { id }, select: politicianSelect });
  }

  create(slug: string, dto: CreatePoliticianDto): Promise<PoliticianResult> {
    return this.prisma.politician.create({ data: { slug, ...dto }, select: politicianSelect });
  }

  findAllWithScores(): Promise<PoliticianResult[]> {
    return this.prisma.politician.findMany({
      where: { score: { isNot: null } },
      select: politicianSelect,
      orderBy: { score: { overall: "desc" } },
    });
  }

  update(id: string, data: Partial<CreatePoliticianDto>): Promise<PoliticianResult> {
    return this.prisma.politician.update({ where: { id }, data, select: politicianSelect });
  }
}
