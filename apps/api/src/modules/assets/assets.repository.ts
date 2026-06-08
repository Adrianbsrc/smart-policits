import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";
import { PrismaService } from "../../config/prisma.service";

const ASSET_SELECT = {
  id: true,
  year: true,
  totalValueBrl: true,
  assets: true,
  declarationUrl: true,
  sourceLabel: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.AssetDeclarationSelect;

export type AssetDeclarationResult = Prisma.AssetDeclarationGetPayload<{
  select: typeof ASSET_SELECT;
}>;

@Injectable()
export class AssetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(politicianId: string): Promise<AssetDeclarationResult[]> {
    return this.prisma.assetDeclaration.findMany({
      where: { politicianId },
      select: ASSET_SELECT,
      orderBy: { year: "desc" },
    });
  }

  async findByYear(politicianId: string, year: number): Promise<AssetDeclarationResult | null> {
    return this.prisma.assetDeclaration.findUnique({
      where: { politicianId_year: { politicianId, year } },
      select: ASSET_SELECT,
    });
  }
}
