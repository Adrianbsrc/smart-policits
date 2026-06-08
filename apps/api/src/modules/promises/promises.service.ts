import { Injectable, NotFoundException } from "@nestjs/common";
import { paginate, type PaginatedResponse } from "../../common/dto/pagination.dto";
import { PrismaService } from "../../config/prisma.service";
import { PromisesRepository } from "./promises.repository";
import type { ListPromisesDto } from "./dto/list-promises.dto";
import type { CreatePromiseDto } from "./dto/create-promise.dto";
import type { PromiseResult } from "./promises.repository";

@Injectable()
export class PromisesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: PromisesRepository,
  ) {}

  private async resolvePoliticianId(slug: string): Promise<string> {
    const politician = await this.prisma.politician.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!politician) throw new NotFoundException(`Político "${slug}" não encontrado`);
    return politician.id;
  }

  async list(slug: string, query: ListPromisesDto): Promise<PaginatedResponse<PromiseResult>> {
    const politicianId = await this.resolvePoliticianId(slug);
    const { data, total } = await this.repository.findMany(politicianId, query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return paginate(data, total, page, limit);
  }

  async create(slug: string, dto: CreatePromiseDto): Promise<PromiseResult> {
    const politicianId = await this.resolvePoliticianId(slug);
    return this.repository.create(politicianId, dto);
  }

  async update(
    slug: string,
    promiseId: string,
    data: Partial<CreatePromiseDto> & { resolvedAt?: string },
  ): Promise<PromiseResult> {
    const politicianId = await this.resolvePoliticianId(slug);
    const updated = await this.repository.update(promiseId, politicianId, data);
    if (!updated) throw new NotFoundException(`Promessa "${promiseId}" não encontrada`);
    return updated;
  }
}
