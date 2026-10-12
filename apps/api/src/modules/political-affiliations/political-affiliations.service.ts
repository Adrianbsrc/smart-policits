import { Injectable, NotFoundException } from "@nestjs/common";

import { PoliticalPartiesService } from "../political-parties/political-parties.service";
import { PoliticalProfilesService } from "../political-profiles/political-profiles.service";
import { PoliticalAffiliationsRepository, type PoliticalAffiliationResult } from "./political-affiliations.repository";
import type { CreatePoliticalAffiliationDto } from "./dto/create-political-affiliation.dto";
import type { UpdatePoliticalAffiliationDto } from "./dto/update-political-affiliation.dto";

@Injectable()
export class PoliticalAffiliationsService {
  constructor(
    private readonly politicalAffiliationsRepository: PoliticalAffiliationsRepository,
    private readonly politicalProfilesService: PoliticalProfilesService,
    private readonly politicalPartiesService: PoliticalPartiesService,
  ) {}

  async findByIdOrThrow(id: string): Promise<PoliticalAffiliationResult> {
    const affiliation = await this.politicalAffiliationsRepository.findById(id);
    if (!affiliation) throw new NotFoundException(`Filiação ${id} não encontrada`);
    return affiliation;
  }

  async create(dto: CreatePoliticalAffiliationDto): Promise<PoliticalAffiliationResult> {
    await this.politicalProfilesService.findByIdOrThrow(dto.profileId);
    await this.politicalPartiesService.findByIdOrThrow(dto.partyId);

    if (dto.isCurrent) {
      await this.politicalAffiliationsRepository.unsetCurrentForProfile(dto.profileId);
    }
    return this.politicalAffiliationsRepository.create(dto);
  }

  async update(id: string, dto: UpdatePoliticalAffiliationDto): Promise<PoliticalAffiliationResult> {
    const affiliation = await this.findByIdOrThrow(id);
    if (dto.partyId) await this.politicalPartiesService.findByIdOrThrow(dto.partyId);

    if (dto.isCurrent) {
      await this.politicalAffiliationsRepository.unsetCurrentForProfile(affiliation.profileId, id);
    }
    return this.politicalAffiliationsRepository.update(id, dto);
  }

  async delete(id: string): Promise<PoliticalAffiliationResult> {
    await this.findByIdOrThrow(id);
    return this.politicalAffiliationsRepository.delete(id);
  }
}
