import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { slugify } from "@smart-politics/core";

import { paginate } from "../../common/dto/pagination.dto";
import { CamaraApiService } from "../etl/camara-api.service";
import type { CandidateFilters } from "./candidates.repository";
import { CandidatesRepository } from "./candidates.repository";
import type { CreateCandidateDto } from "./dto/create-candidate.dto";
import type { ListCandidatesDto } from "./dto/list-candidates.dto";

@Injectable()
export class CandidatesService {
  constructor(
    private readonly candidatesRepository: CandidatesRepository,
    private readonly camaraApiService: CamaraApiService,
  ) {}

  async findAll(query: ListCandidatesDto) {
    const { page, limit, office, state, party, search } = query;
    const filters: CandidateFilters = { office, state, party, search };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.candidatesRepository.findAll(filters, skip, limit),
      this.candidatesRepository.count(filters),
    ]);

    return paginate(data, total, page, limit);
  }

  async findByIdOrThrow(id: string) {
    const candidate = await this.candidatesRepository.findById(id);
    if (!candidate) throw new NotFoundException(`Candidato ${id} não encontrado`);
    return candidate;
  }

  async findBySlugOrThrow(slug: string) {
    const candidate = await this.candidatesRepository.findBySlug(slug);
    if (!candidate) throw new NotFoundException(`Candidato "${slug}" não encontrado`);
    return candidate;
  }

  async create(dto: CreateCandidateDto) {
    const slug = slugify(dto.name);
    const existing = await this.candidatesRepository.findBySlug(slug);
    if (existing) throw new ConflictException(`Candidato com slug "${slug}" já existe`);
    return this.candidatesRepository.create(slug, dto);
  }

  findAllWithScores() {
    return this.candidatesRepository.findAllWithScores();
  }

  async update(id: string, dto: Partial<CreateCandidateDto>) {
    const candidate = await this.candidatesRepository.findById(id);
    if (!candidate) throw new NotFoundException(`Candidato ${id} não encontrado`);
    return this.candidatesRepository.update(id, dto);
  }

  async getCamaraVotacoes(slug: string) {
    const candidate = await this.candidatesRepository.findBySlug(slug);
    if (!candidate) throw new NotFoundException(`Candidato "${slug}" não encontrado`);
    if (candidate.office !== "federal_deputy" || !candidate.tseId || !/^\d+$/.test(candidate.tseId)) {
      return { dados: [] };
    }
    const votacoes = await this.camaraApiService.getVotacoes(candidate.tseId);
    return { dados: votacoes };
  }
}
