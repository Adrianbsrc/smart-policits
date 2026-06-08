import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";
import { PrismaService } from "../../config/prisma.service";
import type { ListPromisesDto } from "./dto/list-promises.dto";
import type { CreatePromiseDto } from "./dto/create-promise.dto";

const PROMISE_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  category: true,
  madeAt: true,
  resolvedAt: true,
  sourceUrl: true,
  evidenceUrl: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PoliticalPromiseSelect;

export type PromiseResult = Prisma.PoliticalPromiseGetPayload<{
  select: typeof PROMISE_SELECT;
}>;

@Injectable()
export class PromisesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    politicianId: string,
    query: ListPromisesDto,
  ): Promise<{ data: PromiseResult[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PoliticalPromiseWhereInput = {
      politicianId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.politicalPromise.findMany({
        where,
        select: PROMISE_SELECT,
        orderBy: { madeAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.politicalPromise.count({ where }),
    ]);

    return { data, total };
  }

  async create(politicianId: string, dto: CreatePromiseDto): Promise<PromiseResult> {
    return this.prisma.politicalPromise.create({
      data: {
        politicianId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        category: dto.category,
        madeAt: dto.madeAt ? new Date(dto.madeAt) : null,
        sourceUrl: dto.sourceUrl ?? null,
        evidenceUrl: dto.evidenceUrl ?? null,
        notes: dto.notes ?? null,
      },
      select: PROMISE_SELECT,
    });
  }

  async update(
    id: string,
    politicianId: string,
    data: Partial<CreatePromiseDto> & { resolvedAt?: string },
  ): Promise<PromiseResult | null> {
    return this.prisma.politicalPromise.update({
      where: { id, politicianId },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.sourceUrl ? { sourceUrl: data.sourceUrl } : {}),
        ...(data.evidenceUrl ? { evidenceUrl: data.evidenceUrl } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.resolvedAt ? { resolvedAt: new Date(data.resolvedAt) } : {}),
      },
      select: PROMISE_SELECT,
    });
  }
}
