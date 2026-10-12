import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { PoliticalOfficesRepository, type PoliticalOfficeResult } from "./political-offices.repository";
import type { CreatePoliticalOfficeDto } from "./dto/create-political-office.dto";
import type { UpdatePoliticalOfficeDto } from "./dto/update-political-office.dto";

@Injectable()
export class PoliticalOfficesService {
  constructor(private readonly politicalOfficesRepository: PoliticalOfficesRepository) {}

  findAll(): Promise<PoliticalOfficeResult[]> {
    return this.politicalOfficesRepository.findAll();
  }

  async findByIdOrThrow(id: string): Promise<PoliticalOfficeResult> {
    const office = await this.politicalOfficesRepository.findById(id);
    if (!office) throw new NotFoundException(`Cargo ${id} não encontrado`);
    return office;
  }

  async create(dto: CreatePoliticalOfficeDto): Promise<PoliticalOfficeResult> {
    const existing = await this.politicalOfficesRepository.findByType(dto.type);
    if (existing) throw new ConflictException(`Cargo do tipo "${dto.type}" já existe`);
    return this.politicalOfficesRepository.create(dto);
  }

  async update(id: string, dto: UpdatePoliticalOfficeDto): Promise<PoliticalOfficeResult> {
    await this.findByIdOrThrow(id);
    return this.politicalOfficesRepository.update(id, dto);
  }

  async delete(id: string): Promise<PoliticalOfficeResult> {
    await this.findByIdOrThrow(id);
    return this.politicalOfficesRepository.delete(id);
  }
}
