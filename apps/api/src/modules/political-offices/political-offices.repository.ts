import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";
import type { CreatePoliticalOfficeDto } from "./dto/create-political-office.dto";
import type { UpdatePoliticalOfficeDto } from "./dto/update-political-office.dto";

const politicalOfficeSelect = {
  id: true,
  type: true,
  name: true,
  scope: true,
  termYears: true,
} as const satisfies Prisma.PoliticalOfficeSelect;

export type PoliticalOfficeResult = Prisma.PoliticalOfficeGetPayload<{ select: typeof politicalOfficeSelect }>;

@Injectable()
export class PoliticalOfficesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PoliticalOfficeResult[]> {
    return this.prisma.politicalOffice.findMany({ select: politicalOfficeSelect, orderBy: { name: "asc" } });
  }

  findById(id: string): Promise<PoliticalOfficeResult | null> {
    return this.prisma.politicalOffice.findUnique({ where: { id }, select: politicalOfficeSelect });
  }

  findByType(type: CreatePoliticalOfficeDto["type"]): Promise<PoliticalOfficeResult | null> {
    return this.prisma.politicalOffice.findUnique({ where: { type }, select: politicalOfficeSelect });
  }

  create(dto: CreatePoliticalOfficeDto): Promise<PoliticalOfficeResult> {
    return this.prisma.politicalOffice.create({ data: dto, select: politicalOfficeSelect });
  }

  update(id: string, dto: UpdatePoliticalOfficeDto): Promise<PoliticalOfficeResult> {
    return this.prisma.politicalOffice.update({ where: { id }, data: dto, select: politicalOfficeSelect });
  }

  delete(id: string): Promise<PoliticalOfficeResult> {
    return this.prisma.politicalOffice.delete({ where: { id }, select: politicalOfficeSelect });
  }
}
