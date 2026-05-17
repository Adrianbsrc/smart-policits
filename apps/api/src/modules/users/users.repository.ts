import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";

const userSelect = {
  id: true,
  supabaseId: true,
  email: true,
  name: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect;

export type UserResult = Prisma.UserGetPayload<{ select: typeof userSelect }>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<UserResult[]> {
    return this.prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string): Promise<UserResult | null> {
    return this.prisma.user.findUnique({ where: { id }, select: userSelect });
  }

  findByEmail(email: string): Promise<UserResult | null> {
    return this.prisma.user.findUnique({ where: { email }, select: userSelect });
  }

  findBySupabaseId(supabaseId: string): Promise<UserResult | null> {
    return this.prisma.user.findUnique({ where: { supabaseId }, select: userSelect });
  }

  create(supabaseId: string, dto: CreateUserDto): Promise<UserResult> {
    return this.prisma.user.create({
      data: { supabaseId, ...dto },
      select: userSelect,
    });
  }

  upsertBySupabaseId(
    supabaseId: string,
    data: { email: string; name?: string },
  ): Promise<UserResult> {
    return this.prisma.user.upsert({
      where: { supabaseId },
      create: { supabaseId, email: data.email, name: data.name },
      update: {},
      select: userSelect,
    });
  }

  update(id: string, dto: UpdateUserDto): Promise<UserResult> {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: userSelect,
    });
  }

  delete(id: string): Promise<UserResult> {
    return this.prisma.user.delete({ where: { id }, select: userSelect });
  }
}
