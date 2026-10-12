import { Injectable } from "@nestjs/common";
import type { PoliticalProfileStatus, Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";
import type { CreatePoliticalProfileDto } from "./dto/create-political-profile.dto";
import type { UpdatePoliticalProfileDto } from "./dto/update-political-profile.dto";

const politicalProfileSelect = {
  id: true,
  slug: true,
  fullName: true,
  displayName: true,
  biography: true,
  photo: true,
  birthDate: true,
  birthPlace: true,
  status: true,
  isCandidate: true,
  isIncumbent: true,
  createdAt: true,
  updatedAt: true,
  currentOffice: { select: { id: true, type: true, name: true, scope: true, termYears: true } },
  // Filiação partidária vive em PoliticalAffiliation — no máximo uma isCurrent=true.
  affiliations: {
    where: { isCurrent: true },
    take: 1,
    select: {
      id: true,
      startDate: true,
      party: { select: { id: true, name: true, acronym: true, number: true, logo: true } },
    },
  },
} as const satisfies Prisma.PoliticalProfileSelect;

const mandateWithOfficeSelect = {
  id: true,
  startDate: true,
  endDate: true,
  reelected: true,
  description: true,
  electionYear: true,
  electionRound: true,
  votes: true,
  electoralResult: true,
  startReason: true,
  endReason: true,
  viceProfileId: true,
  office: { select: { id: true, type: true, name: true, scope: true, termYears: true } },
  viceProfile: { select: { id: true, slug: true, fullName: true, displayName: true, photo: true } },
} as const satisfies Prisma.MandateSelect;

const affiliationWithPartySelect = {
  id: true,
  startDate: true,
  endDate: true,
  isCurrent: true,
  reason: true,
  party: { select: { id: true, name: true, acronym: true, number: true, logo: true } },
} as const satisfies Prisma.PoliticalAffiliationSelect;

export type PoliticalProfileResult = Prisma.PoliticalProfileGetPayload<{ select: typeof politicalProfileSelect }>;
export type MandateWithOffice = Prisma.MandateGetPayload<{ select: typeof mandateWithOfficeSelect }>;
export type AffiliationWithParty = Prisma.PoliticalAffiliationGetPayload<{ select: typeof affiliationWithPartySelect }>;

export interface PoliticalProfileFilters {
  status?: PoliticalProfileStatus;
  partyId?: string;
  officeId?: string;
  search?: string;
}

@Injectable()
export class PoliticalProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filters: PoliticalProfileFilters): Prisma.PoliticalProfileWhereInput {
    return {
      ...(filters.status && { status: filters.status }),
      ...(filters.partyId && { affiliations: { some: { partyId: filters.partyId, isCurrent: true } } }),
      ...(filters.officeId && { currentOfficeId: filters.officeId }),
      ...(filters.search && {
        OR: [
          { fullName: { contains: filters.search, mode: "insensitive" } },
          { displayName: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    };
  }

  count(filters: PoliticalProfileFilters): Promise<number> {
    return this.prisma.politicalProfile.count({ where: this.buildWhere(filters) });
  }

  findAll(filters: PoliticalProfileFilters, skip: number, take: number): Promise<PoliticalProfileResult[]> {
    return this.prisma.politicalProfile.findMany({
      where: this.buildWhere(filters),
      select: politicalProfileSelect,
      orderBy: { displayName: "asc" },
      skip,
      take,
    });
  }

  findBySlug(slug: string): Promise<PoliticalProfileResult | null> {
    return this.prisma.politicalProfile.findUnique({ where: { slug }, select: politicalProfileSelect });
  }

  findById(id: string): Promise<PoliticalProfileResult | null> {
    return this.prisma.politicalProfile.findUnique({ where: { id }, select: politicalProfileSelect });
  }

  create(slug: string, dto: CreatePoliticalProfileDto): Promise<PoliticalProfileResult> {
    return this.prisma.politicalProfile.create({ data: { slug, ...dto }, select: politicalProfileSelect });
  }

  update(id: string, dto: UpdatePoliticalProfileDto): Promise<PoliticalProfileResult> {
    return this.prisma.politicalProfile.update({ where: { id }, data: dto, select: politicalProfileSelect });
  }

  delete(id: string): Promise<PoliticalProfileResult> {
    return this.prisma.politicalProfile.delete({ where: { id }, select: politicalProfileSelect });
  }

  findMandatesByProfileId(profileId: string): Promise<MandateWithOffice[]> {
    return this.prisma.mandate.findMany({
      where: { profileId },
      select: mandateWithOfficeSelect,
      orderBy: { startDate: "desc" },
    });
  }

  findAffiliationsByProfileId(profileId: string): Promise<AffiliationWithParty[]> {
    return this.prisma.politicalAffiliation.findMany({
      where: { profileId },
      select: affiliationWithPartySelect,
      orderBy: { startDate: "desc" },
    });
  }
}
