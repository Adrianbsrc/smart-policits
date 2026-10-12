import { Injectable, NotFoundException } from "@nestjs/common";

import { PoliticalOfficesService } from "../political-offices/political-offices.service";
import { PoliticalProfilesService } from "../political-profiles/political-profiles.service";
import { MandatesRepository, type MandateResult } from "./mandates.repository";
import type { CreateMandateDto } from "./dto/create-mandate.dto";
import type { UpdateMandateDto } from "./dto/update-mandate.dto";

@Injectable()
export class MandatesService {
  constructor(
    private readonly mandatesRepository: MandatesRepository,
    private readonly politicalProfilesService: PoliticalProfilesService,
    private readonly politicalOfficesService: PoliticalOfficesService,
  ) {}

  async findByIdOrThrow(id: string): Promise<MandateResult> {
    const mandate = await this.mandatesRepository.findById(id);
    if (!mandate) throw new NotFoundException(`Mandato ${id} não encontrado`);
    return mandate;
  }

  async create(dto: CreateMandateDto): Promise<MandateResult> {
    await this.politicalProfilesService.findByIdOrThrow(dto.profileId);
    await this.politicalOfficesService.findByIdOrThrow(dto.officeId);
    if (dto.viceProfileId) await this.politicalProfilesService.findByIdOrThrow(dto.viceProfileId);
    return this.mandatesRepository.create(dto);
  }

  async update(id: string, dto: UpdateMandateDto): Promise<MandateResult> {
    await this.findByIdOrThrow(id);
    if (dto.profileId) await this.politicalProfilesService.findByIdOrThrow(dto.profileId);
    if (dto.officeId) await this.politicalOfficesService.findByIdOrThrow(dto.officeId);
    if (dto.viceProfileId) await this.politicalProfilesService.findByIdOrThrow(dto.viceProfileId);
    return this.mandatesRepository.update(id, dto);
  }

  async delete(id: string): Promise<MandateResult> {
    await this.findByIdOrThrow(id);
    return this.mandatesRepository.delete(id);
  }
}
