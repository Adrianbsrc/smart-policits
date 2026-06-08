import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";
import { PrismaService } from "../../config/prisma.service";
import type { ListTimelineDto } from "./dto/list-timeline.dto";

const EVENT_SELECT = {
  id: true,
  type: true,
  title: true,
  description: true,
  eventDate: true,
  sourceUrl: true,
  sourceLabel: true,
  externalId: true,
  interpretationHash: true,
  topics: true,
  sentiment: true,
  impact: true,
  metadata: true,
  createdAt: true,
  evidences: {
    select: {
      dimension: true,
      explanation: true,
      deltaValue: true,
    },
  },
} as const satisfies Prisma.PoliticalEventSelect;

export type PoliticalEventResult = Prisma.PoliticalEventGetPayload<{
  select: typeof EVENT_SELECT;
}>;

@Injectable()
export class TimelineRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPoliticianId(
    politicianId: string,
    query: ListTimelineDto,
  ): Promise<{ data: PoliticalEventResult[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PoliticalEventWhereInput = {
      politicianId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.from || query.to
        ? {
            eventDate: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.politicalEvent.findMany({
        where,
        select: EVENT_SELECT,
        orderBy: { eventDate: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.politicalEvent.count({ where }),
    ]);

    return { data, total };
  }
}
