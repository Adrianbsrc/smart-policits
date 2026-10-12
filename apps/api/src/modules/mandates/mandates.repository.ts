import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";
import type { CreateMandateDto } from "./dto/create-mandate.dto";
import type { UpdateMandateDto } from "./dto/update-mandate.dto";

const mandateSelect = {
  id: true,
  profileId: true,
  officeId: true,
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
  createdAt: true,
  updatedAt: true,
  office: { select: { id: true, type: true, name: true, scope: true, termYears: true } },
  viceProfile: { select: { id: true, slug: true, fullName: true, displayName: true, photo: true } },
} as const satisfies Prisma.MandateSelect;

export type MandateResult = Prisma.MandateGetPayload<{ select: typeof mandateSelect }>;

@Injectable()
export class MandatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<MandateResult | null> {
    return this.prisma.mandate.findUnique({ where: { id }, select: mandateSelect });
  }

  create(dto: CreateMandateDto): Promise<MandateResult> {
    return this.prisma.mandate.create({ data: dto, select: mandateSelect });
  }

  update(id: string, dto: UpdateMandateDto): Promise<MandateResult> {
    return this.prisma.mandate.update({ where: { id }, data: dto, select: mandateSelect });
  }

  delete(id: string): Promise<MandateResult> {
    return this.prisma.mandate.delete({ where: { id }, select: mandateSelect });
  }
}
