import { Injectable } from "@nestjs/common";

import { PoliticalProfilesService } from "../political-profiles/political-profiles.service";
import type { PromiseEntity } from "./domain/promise.entity";
import { toPromiseDtos } from "./political-promises.mapper";
import type { PromiseResponseDto } from "./dto/promise-response.dto";

@Injectable()
export class PoliticalPromisesService {
  constructor(private readonly politicalProfilesService: PoliticalProfilesService) {}

  async getPromises(slug: string): Promise<PromiseResponseDto[]> {
    // Garante 404 consistente com os demais sub-recursos de /profiles/:slug.
    await this.politicalProfilesService.findBySlugOrThrow(slug);

    const promises = await this.fetchPromisesForProfile(slug);
    return toPromiseDtos(promises);
  }

  /**
   * Único ponto de integração com uma futura fonte de dados (ETL ou tabela
   * dedicada). Hoje não existe nenhum PoliticalPromise vinculado a
   * PoliticalProfile — retorna lista vazia. Quando a persistência existir,
   * apenas este método muda; domain/mapper/DTO/controller/frontend
   * permanecem intactos.
   */
  private async fetchPromisesForProfile(_slug: string): Promise<PromiseEntity[]> {
    return [];
  }
}
