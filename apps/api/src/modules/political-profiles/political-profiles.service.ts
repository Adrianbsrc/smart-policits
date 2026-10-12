import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { slugify } from "@smart-politics/core";

import { paginate, type PaginatedResponse } from "../../common/dto/pagination.dto";
import type {
  AffiliationWithParty,
  MandateWithOffice,
  PoliticalProfileFilters,
  PoliticalProfileResult,
} from "./political-profiles.repository";
import { PoliticalProfilesRepository } from "./political-profiles.repository";
import { toExecutiveSummaryDto } from "./political-profiles.mapper";
import type { CreatePoliticalProfileDto } from "./dto/create-political-profile.dto";
import type { ListPoliticalProfilesDto } from "./dto/list-political-profiles.dto";
import type { UpdatePoliticalProfileDto } from "./dto/update-political-profile.dto";
import type { ExecutiveSummaryResponseDto } from "./dto/executive-summary-response.dto";

@Injectable()
export class PoliticalProfilesService {
  constructor(private readonly politicalProfilesRepository: PoliticalProfilesRepository) {}

  async findAll(query: ListPoliticalProfilesDto): Promise<PaginatedResponse<PoliticalProfileResult>> {
    const { page, limit, status, partyId, officeId, search } = query;
    const filters: PoliticalProfileFilters = { status, partyId, officeId, search };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.politicalProfilesRepository.findAll(filters, skip, limit),
      this.politicalProfilesRepository.count(filters),
    ]);

    return paginate(data, total, page, limit);
  }

  async findBySlugOrThrow(slug: string): Promise<PoliticalProfileResult> {
    const profile = await this.politicalProfilesRepository.findBySlug(slug);
    if (!profile) throw new NotFoundException(`Perfil "${slug}" não encontrado`);
    return profile;
  }

  async findByIdOrThrow(id: string): Promise<PoliticalProfileResult> {
    const profile = await this.politicalProfilesRepository.findById(id);
    if (!profile) throw new NotFoundException(`Perfil ${id} não encontrado`);
    return profile;
  }

  async findMandatesBySlug(slug: string): Promise<MandateWithOffice[]> {
    const profile = await this.politicalProfilesRepository.findBySlug(slug);
    if (!profile) throw new NotFoundException(`Perfil "${slug}" não encontrado`);
    return this.politicalProfilesRepository.findMandatesByProfileId(profile.id);
  }

  async findAffiliationsBySlug(slug: string): Promise<AffiliationWithParty[]> {
    const profile = await this.politicalProfilesRepository.findBySlug(slug);
    if (!profile) throw new NotFoundException(`Perfil "${slug}" não encontrado`);
    return this.politicalProfilesRepository.findAffiliationsByProfileId(profile.id);
  }

  /**
   * Variantes por id — para consumidores que já resolveram o perfil (ex:
   * PoliticalEvidenceService) e não devem repetir a busca por slug.
   */
  findMandatesByProfileId(profileId: string): Promise<MandateWithOffice[]> {
    return this.politicalProfilesRepository.findMandatesByProfileId(profileId);
  }

  findAffiliationsByProfileId(profileId: string): Promise<AffiliationWithParty[]> {
    return this.politicalProfilesRepository.findAffiliationsByProfileId(profileId);
  }

  async getExecutiveSummary(slug: string): Promise<ExecutiveSummaryResponseDto> {
    const profile = await this.findBySlugOrThrow(slug);
    const mandates = await this.politicalProfilesRepository.findMandatesByProfileId(profile.id);
    return toExecutiveSummaryDto(profile, mandates);
  }

  async create(dto: CreatePoliticalProfileDto): Promise<PoliticalProfileResult> {
    const slug = slugify(dto.fullName);
    const existing = await this.politicalProfilesRepository.findBySlug(slug);
    if (existing) throw new ConflictException(`Perfil com slug "${slug}" já existe`);
    return this.politicalProfilesRepository.create(slug, dto);
  }

  async update(id: string, dto: UpdatePoliticalProfileDto): Promise<PoliticalProfileResult> {
    await this.findByIdOrThrow(id);
    return this.politicalProfilesRepository.update(id, dto);
  }

  async delete(id: string): Promise<PoliticalProfileResult> {
    await this.findByIdOrThrow(id);
    return this.politicalProfilesRepository.delete(id);
  }
}
