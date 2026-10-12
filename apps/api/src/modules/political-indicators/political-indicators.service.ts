import { Injectable } from "@nestjs/common";

import { PoliticalProfilesService } from "../political-profiles/political-profiles.service";
import type { Indicator } from "./domain/indicator.entity";
import { toIndicatorDtos } from "./political-indicators.mapper";
import type { IndicatorResponseDto } from "./dto/indicator-response.dto";

@Injectable()
export class PoliticalIndicatorsService {
  constructor(private readonly politicalProfilesService: PoliticalProfilesService) {}

  async getIndicators(slug: string): Promise<IndicatorResponseDto[]> {
    // Garante 404 consistente com os demais sub-recursos de /profiles/:slug.
    await this.politicalProfilesService.findBySlugOrThrow(slug);

    const indicators = await this.fetchIndicatorsForProfile(slug);
    return toIndicatorDtos(indicators);
  }

  /**
   * Único ponto de integração com uma futura fonte de dados (ETL — IBGE,
   * Banco Central, IPEA, DATASUS conforme docs/SPECs/sources.md). Hoje não
   * existe nenhum Indicator vinculado a PoliticalProfile — retorna lista
   * vazia. Quando a persistência existir, apenas este método muda;
   * domain/mapper/DTO/controller/frontend permanecem intactos.
   */
  private async fetchIndicatorsForProfile(_slug: string): Promise<Indicator[]> {
    return [];
  }
}
