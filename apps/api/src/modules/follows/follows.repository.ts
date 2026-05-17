import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";

const followSelect = {
  id: true,
  politicianId: true,
  createdAt: true,
  politician: {
    select: {
      id: true,
      name: true,
      slug: true,
      office: true,
      state: true,
      photoUrl: true,
      party: { select: { name: true, acronym: true, colorHex: true } },
      score: {
        select: {
          overall: true,
          education: true,
          health: true,
          security: true,
          economy: true,
          transparency: true,
        },
      },
    },
  },
} as const satisfies Prisma.FollowSelect;

export type FollowWithPolitician = Prisma.FollowGetPayload<{ select: typeof followSelect }>;

@Injectable()
export class FollowsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: string): Promise<FollowWithPolitician[]> {
    return this.prisma.follow.findMany({
      where: { userId },
      select: followSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  findByUserAndPolitician(userId: string, politicianId: string): Promise<FollowWithPolitician | null> {
    return this.prisma.follow.findUnique({
      where: { userId_politicianId: { userId, politicianId } },
      select: followSelect,
    });
  }

  create(userId: string, politicianId: string): Promise<FollowWithPolitician> {
    return this.prisma.follow.create({
      data: { userId, politicianId },
      select: followSelect,
    });
  }

  async delete(userId: string, politicianId: string): Promise<void> {
    await this.prisma.follow.delete({
      where: { userId_politicianId: { userId, politicianId } },
    });
  }

  async isFollowing(userId: string, politicianId: string): Promise<boolean> {
    const count = await this.prisma.follow.count({ where: { userId, politicianId } });
    return count > 0;
  }
}
