import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";
import type { CreatePoliticalPartyDto } from "./dto/create-political-party.dto";
import type { UpdatePoliticalPartyDto } from "./dto/update-political-party.dto";

const politicalPartySelect = {
  id: true,
  name: true,
  acronym: true,
  number: true,
  logo: true,
  _count: { select: { affiliations: true } },
} as const satisfies Prisma.PoliticalPartySelect;

export type PoliticalPartyResult = Prisma.PoliticalPartyGetPayload<{ select: typeof politicalPartySelect }>;

@Injectable()
export class PoliticalPartiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PoliticalPartyResult[]> {
    return this.prisma.politicalParty.findMany({ select: politicalPartySelect, orderBy: { acronym: "asc" } });
  }

  findById(id: string): Promise<PoliticalPartyResult | null> {
    return this.prisma.politicalParty.findUnique({ where: { id }, select: politicalPartySelect });
  }

  findByAcronym(acronym: string): Promise<PoliticalPartyResult | null> {
    return this.prisma.politicalParty.findUnique({
      where: { acronym: acronym.toUpperCase() },
      select: politicalPartySelect,
    });
  }

  create(dto: CreatePoliticalPartyDto): Promise<PoliticalPartyResult> {
    return this.prisma.politicalParty.create({ data: dto, select: politicalPartySelect });
  }

  update(id: string, dto: UpdatePoliticalPartyDto): Promise<PoliticalPartyResult> {
    return this.prisma.politicalParty.update({ where: { id }, data: dto, select: politicalPartySelect });
  }

  delete(id: string): Promise<PoliticalPartyResult> {
    return this.prisma.politicalParty.delete({ where: { id }, select: politicalPartySelect });
  }
}
