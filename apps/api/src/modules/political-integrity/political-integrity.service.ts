import { Injectable } from "@nestjs/common";

import { PoliticalProfilesService } from "../political-profiles/political-profiles.service";
import type { IntegrityRecord } from "./domain/integrity-record.entity";
import { toIntegrityRecordDtos } from "./political-integrity.mapper";
import type { IntegrityRecordResponseDto } from "./dto/integrity-record-response.dto";

@Injectable()
export class PoliticalIntegrityService {
  constructor(private readonly politicalProfilesService: PoliticalProfilesService) {}

  async getIntegrityRecords(slug: string): Promise<IntegrityRecordResponseDto[]> {
    // Garante 404 consistente com os demais sub-recursos de /profiles/:slug.
    await this.politicalProfilesService.findBySlugOrThrow(slug);

    const records = await this.fetchIntegrityRecordsForProfile(slug);
    return toIntegrityRecordDtos(records);
  }

  /**
   * Único ponto de integração com fontes oficiais futuras (STF, STJ, TCU,
   * CGU e demais órgãos — docs/SPECs/sources.md). Hoje não existe nenhum
   * IntegrityRecord vinculado a PoliticalProfile — retorna lista vazia.
   * Quando a persistência existir, apenas este método muda;
   * domain/mapper/DTO/controller/frontend permanecem intactos.
   */
  private async fetchIntegrityRecordsForProfile(_slug: string): Promise<IntegrityRecord[]> {
    return [];
  }
}
