import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { slugify } from "@smart-politics/core";

import { paginate, type PaginatedResponse } from "../../common/dto/pagination.dto";
import { type CamaraVoto, CamaraApiService } from "../etl/camara-api.service";
import type { PoliticianFilters, PoliticianResult } from "./politicians.repository";
import { PoliticiansRepository } from "./politicians.repository";
import type { CreatePoliticianDto } from "./dto/create-politician.dto";
import type { ListPoliticiansDto } from "./dto/list-politicians.dto";

@Injectable()
export class PoliticiansService {
  constructor(
    private readonly politiciansRepository: PoliticiansRepository,
    private readonly camaraApiService: CamaraApiService,
  ) {}

  async findAll(query: ListPoliticiansDto): Promise<PaginatedResponse<PoliticianResult>> {
    const { page, limit, office, state, party, search } = query;
    const filters: PoliticianFilters = { office, state, party, search };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.politiciansRepository.findAll(filters, skip, limit),
      this.politiciansRepository.count(filters),
    ]);

    return paginate(data, total, page, limit);
  }

  async findByIdOrThrow(id: string): Promise<PoliticianResult> {
    const politician = await this.politiciansRepository.findById(id);
    if (!politician) throw new NotFoundException(`Político ${id} não encontrado`);
    return politician;
  }

  async findBySlugOrThrow(slug: string): Promise<PoliticianResult> {
    const politician = await this.politiciansRepository.findBySlug(slug);
    if (!politician) throw new NotFoundException(`Político "${slug}" não encontrado`);
    return politician;
  }

  async create(dto: CreatePoliticianDto): Promise<PoliticianResult> {
    const slug = slugify(dto.name);
    const existing = await this.politiciansRepository.findBySlug(slug);
    if (existing) throw new ConflictException(`Político com slug "${slug}" já existe`);
    return this.politiciansRepository.create(slug, dto);
  }

  findAllWithScores(): Promise<PoliticianResult[]> {
    return this.politiciansRepository.findAllWithScores();
  }

  async update(id: string, dto: Partial<CreatePoliticianDto>): Promise<PoliticianResult> {
    const politician = await this.politiciansRepository.findById(id);
    if (!politician) throw new NotFoundException(`Político ${id} não encontrado`);
    return this.politiciansRepository.update(id, dto);
  }

  async getCamaraVotacoes(slug: string): Promise<{ dados: CamaraVoto[] }> {
    const politician = await this.politiciansRepository.findBySlug(slug);
    if (!politician) throw new NotFoundException(`Político "${slug}" não encontrado`);
    if (politician.office !== "federal_deputy" || !politician.tseId || !/^\d+$/.test(politician.tseId)) {
      return { dados: [] };
    }
    const votacoes = await this.camaraApiService.getVotacoes(politician.tseId);
    return { dados: votacoes };
  }
}
