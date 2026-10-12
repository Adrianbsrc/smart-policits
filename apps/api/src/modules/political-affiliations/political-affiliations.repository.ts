import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";
import type { CreatePoliticalAffiliationDto } from "./dto/create-political-affiliation.dto";
import type { UpdatePoliticalAffiliationDto } from "./dto/update-political-affiliation.dto";

const politicalAffiliationSelect = {
  id: true,
  profileId: true,
  partyId: true,
  startDate: true,
  endDate: true,
  isCurrent: true,
  reason: true,
  createdAt: true,
  updatedAt: true,
  party: { select: { id: true, name: true, acronym: true, number: true, logo: true } },
} as const satisfies Prisma.PoliticalAffiliationSelect;

export type PoliticalAffiliationResult = Prisma.PoliticalAffiliationGetPayload<{
  select: typeof politicalAffiliationSelect;
}>;

@Injectable()
export class PoliticalAffiliationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<PoliticalAffiliationResult | null> {
    return this.prisma.politicalAffiliation.findUnique({ where: { id }, select: politicalAffiliationSelect });
  }

  findAllByProfileId(profileId: string): Promise<PoliticalAffiliationResult[]> {
    return this.prisma.politicalAffiliation.findMany({
      where: { profileId },
      select: politicalAffiliationSelect,
      orderBy: { startDate: "desc" },
    });
  }

  create(dto: CreatePoliticalAffiliationDto): Promise<PoliticalAffiliationResult> {
    return this.prisma.politicalAffiliation.create({ data: dto, select: politicalAffiliationSelect });
  }

  update(id: string, dto: UpdatePoliticalAffiliationDto): Promise<PoliticalAffiliationResult> {
    return this.prisma.politicalAffiliation.update({ where: { id }, data: dto, select: politicalAffiliationSelect });
  }

  delete(id: string): Promise<PoliticalAffiliationResult> {
    return this.prisma.politicalAffiliation.delete({ where: { id }, select: politicalAffiliationSelect });
  }

  /** Regra "apenas uma filiação ativa": zera isCurrent das demais filiações do perfil. */
  unsetCurrentForProfile(profileId: string, exceptId?: string): Promise<Prisma.BatchPayload> {
    return this.prisma.politicalAffiliation.updateMany({
      where: { profileId, isCurrent: true, ...(exceptId ? { id: { not: exceptId } } : {}) },
      data: { isCurrent: false },
    });
  }
}
