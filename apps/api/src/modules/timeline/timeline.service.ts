import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { paginate, type PaginatedResponse } from "../../common/dto/pagination.dto";
import { PrismaService } from "../../config/prisma.service";
import { TimelineRepository } from "./timeline.repository";
import type { ListTimelineDto } from "./dto/list-timeline.dto";
import type { PoliticalEventResult } from "./timeline.repository";

const CACHE_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class TimelineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: TimelineRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async getTimeline(slug: string, query: ListTimelineDto): Promise<PaginatedResponse<PoliticalEventResult>> {
    const politician = await this.prisma.politician.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!politician) throw new NotFoundException(`Político "${slug}" não encontrado`);

    const cacheKey = `timeline:${slug}:${query.type ?? "all"}:${query.from ?? ""}:${query.to ?? ""}:${query.page ?? 1}:${query.limit ?? 20}`;
    const cached = await this.cache.get<PaginatedResponse<PoliticalEventResult>>(cacheKey);
    if (cached) return cached;

    const { data, total } = await this.repository.findByPoliticianId(politician.id, query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const result = paginate(data, total, page, limit);

    await this.cache.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  }
}
