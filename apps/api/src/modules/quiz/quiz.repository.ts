import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";

const quizResultSelect = {
  id: true,
  userId: true,
  answers: true,
  completedAt: true,
} as const satisfies Prisma.QuizResultSelect;

export type QuizResultRecord = Prisma.QuizResultGetPayload<{ select: typeof quizResultSelect }>;

@Injectable()
export class QuizRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { userId: string; answers: Prisma.InputJsonValue }): Promise<QuizResultRecord> {
    return this.prisma.quizResult.create({
      data,
      select: quizResultSelect,
    });
  }

  findLatestByUser(userId: string): Promise<QuizResultRecord | null> {
    return this.prisma.quizResult.findFirst({
      where: { userId },
      select: quizResultSelect,
      orderBy: { completedAt: "desc" },
    });
  }

  deleteLatestByUser(userId: string): Promise<{ count: number }> {
    return this.prisma.quizResult
      .findFirst({
        where: { userId },
        select: { id: true },
        orderBy: { completedAt: "desc" },
      })
      .then((record) => {
        if (!record) return { count: 0 };
        return this.prisma.quizResult
          .delete({ where: { id: record.id } })
          .then(() => ({ count: 1 }));
      });
  }
}
