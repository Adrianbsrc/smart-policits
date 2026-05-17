import { Injectable, NotFoundException } from "@nestjs/common";

import { PartiesRepository } from "./parties.repository";

@Injectable()
export class PartiesService {
  constructor(private readonly partiesRepository: PartiesRepository) {}

  findAll() {
    return this.partiesRepository.findAll();
  }

  async findByAcronymOrThrow(acronym: string) {
    const party = await this.partiesRepository.findByAcronym(acronym);
    if (!party) throw new NotFoundException(`Partido "${acronym}" não encontrado`);
    return party;
  }
}
