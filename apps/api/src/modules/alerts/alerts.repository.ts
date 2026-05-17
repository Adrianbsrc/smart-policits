import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";

const alertSelect = {
  id: true,
  type: true,
  title: true,
  body: true,
  read: true,
  createdAt: true,
  politician: {
    select: { id: true, name: true, slug: true, photoUrl: true },
  },
} as const satisfies Prisma.AlertSelect;

export type AlertRecord = Prisma.AlertGetPayload<{ select: typeof alertSelect }>;

@Injectable()
export class AlertsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: string, page: number, limit: number): Promise<AlertRecord[]> {
    return this.prisma.alert.findMany({
      where: { userId },
      select: alertSelect,
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  countByUser(userId: string): Promise<number> {
    return this.prisma.alert.count({ where: { userId } });
  }

  countUnread(userId: string): Promise<number> {
    return this.prisma.alert.count({ where: { userId, read: false } });
  }

  markRead(id: string, userId: string): Promise<{ id: string }> {
    return this.prisma.alert.update({
      where: { id, userId },
      data: { read: true },
      select: { id: true },
    });
  }

  markAllRead(userId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.alert.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  createScoreChangeAlert(data: {
    userId: string;
    politicianId: string;
    politicianName: string;
    oldScore: number;
    newScore: number;
  }): Promise<{ id: string }> {
    const diff = data.newScore - data.oldScore;
    const direction = diff > 0 ? "subiu" : "caiu";
    return this.prisma.alert.create({
      data: {
        userId: data.userId,
        type: "score_change",
        title: `Mudança de nota: ${data.politicianName}`,
        body: `A nota geral de ${data.politicianName} ${direction} de ${data.oldScore.toFixed(1)} para ${data.newScore.toFixed(1)}.`,
        politicianId: data.politicianId,
      },
      select: { id: true },
    });
  }
}
