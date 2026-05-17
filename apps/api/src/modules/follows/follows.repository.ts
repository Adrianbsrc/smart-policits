import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";

const followSelect = {
  id: true,
  candidateId: true,
  createdAt: true,
  candidate: {
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

export type FollowWithCandidate = Prisma.FollowGetPayload<{ select: typeof followSelect }>;

@Injectable()
export class FollowsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: string): Promise<FollowWithCandidate[]> {
    return this.prisma.follow.findMany({
      where: { userId },
      select: followSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  findByUserAndCandidate(userId: string, candidateId: string): Promise<FollowWithCandidate | null> {
    return this.prisma.follow.findUnique({
      where: { userId_candidateId: { userId, candidateId } },
      select: followSelect,
    });
  }

  create(userId: string, candidateId: string): Promise<FollowWithCandidate> {
    return this.prisma.follow.create({
      data: { userId, candidateId },
      select: followSelect,
    });
  }

  async delete(userId: string, candidateId: string): Promise<void> {
    await this.prisma.follow.delete({
      where: { userId_candidateId: { userId, candidateId } },
    });
  }

  async isFollowing(userId: string, candidateId: string): Promise<boolean> {
    const count = await this.prisma.follow.count({ where: { userId, candidateId } });
    return count > 0;
  }
}
