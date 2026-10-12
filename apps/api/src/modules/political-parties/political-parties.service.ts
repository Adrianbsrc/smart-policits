import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { PoliticalPartiesRepository, type PoliticalPartyResult } from "./political-parties.repository";
import type { CreatePoliticalPartyDto } from "./dto/create-political-party.dto";
import type { UpdatePoliticalPartyDto } from "./dto/update-political-party.dto";

@Injectable()
export class PoliticalPartiesService {
  constructor(private readonly politicalPartiesRepository: PoliticalPartiesRepository) {}

  findAll(): Promise<PoliticalPartyResult[]> {
    return this.politicalPartiesRepository.findAll();
  }

  async findByIdOrThrow(id: string): Promise<PoliticalPartyResult> {
    const party = await this.politicalPartiesRepository.findById(id);
    if (!party) throw new NotFoundException(`Partido ${id} não encontrado`);
    return party;
  }

  async create(dto: CreatePoliticalPartyDto): Promise<PoliticalPartyResult> {
    const existing = await this.politicalPartiesRepository.findByAcronym(dto.acronym);
    if (existing) throw new ConflictException(`Partido com sigla "${dto.acronym}" já existe`);
    return this.politicalPartiesRepository.create(dto);
  }

  async update(id: string, dto: UpdatePoliticalPartyDto): Promise<PoliticalPartyResult> {
    await this.findByIdOrThrow(id);
    return this.politicalPartiesRepository.update(id, dto);
  }

  async delete(id: string): Promise<PoliticalPartyResult> {
    await this.findByIdOrThrow(id);
    return this.politicalPartiesRepository.delete(id);
  }
}
