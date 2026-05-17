import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";

const partySelect = {
  id: true,
  name: true,
  acronym: true,
  colorHex: true,
  logoUrl: true,
  ideology: true,
  _count: { select: { politicians: true } },
} as const satisfies Prisma.PartySelect;

export type PartyResult = Prisma.PartyGetPayload<{ select: typeof partySelect }>;

@Injectable()
export class PartiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PartyResult[]> {
    return this.prisma.party.findMany({
      select: partySelect,
      orderBy: { acronym: "asc" },
    });
  }

  findByAcronym(acronym: string): Promise<PartyResult | null> {
    return this.prisma.party.findUnique({
      where: { acronym: acronym.toUpperCase() },
      select: partySelect,
    });
  }
}
