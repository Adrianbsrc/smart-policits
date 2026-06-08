import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { AssetsRepository } from "./assets.repository";
import type { AssetDeclarationResult } from "./assets.repository";

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: AssetsRepository,
  ) {}

  private async resolvePoliticianId(slug: string): Promise<string> {
    const politician = await this.prisma.politician.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!politician) throw new NotFoundException(`Político "${slug}" não encontrado`);
    return politician.id;
  }

  async findAll(slug: string): Promise<AssetDeclarationResult[]> {
    const politicianId = await this.resolvePoliticianId(slug);
    return this.repository.findAll(politicianId);
  }

  async findByYear(slug: string, year: number): Promise<AssetDeclarationResult> {
    const politicianId = await this.resolvePoliticianId(slug);
    const result = await this.repository.findByYear(politicianId, year);
    if (!result) throw new NotFoundException(`Declaração de patrimônio para ${year} não encontrada`);
    return result;
  }
}
