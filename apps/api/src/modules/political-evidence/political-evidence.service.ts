import { Injectable, NotFoundException } from "@nestjs/common";

import { PoliticalProfilesService } from "../political-profiles/political-profiles.service";
import type { PoliticalProfileResult } from "../political-profiles/political-profiles.repository";
import { buildEvidencesFromPoliticalProfile } from "./builders/political-profile-evidence.builder";
import { PoliticalEvidenceRepository } from "./political-evidence.repository";
import type { Evidence } from "./domain";
import { toEvidenceDto, toEvidenceDtos } from "./political-evidence.mapper";
import type { EvidenceResponseDto } from "./dto/evidence-response.dto";

@Injectable()
export class PoliticalEvidenceService {
  constructor(
    private readonly politicalProfilesService: PoliticalProfilesService,
    private readonly politicalEvidenceRepository: PoliticalEvidenceRepository,
  ) {}

  async getEvidencesForProfile(slug: string): Promise<EvidenceResponseDto[]> {
    // Garante 404 consistente com os demais sub-recursos de /profiles/:slug.
    const profile = await this.politicalProfilesService.findBySlugOrThrow(slug);
    const evidences = await this.fetchEvidencesForProfile(profile);
    return toEvidenceDtos(evidences);
  }

  async getEvidenceById(id: string): Promise<EvidenceResponseDto> {
    const evidence = await this.politicalEvidenceRepository.findById(id);
    if (!evidence) throw new NotFoundException(`Evidence "${id}" não encontrada.`);
    return toEvidenceDto(evidence);
  }

  /**
   * Para consumo interno por outros módulos (ex: PoliticalTimelineService) —
   * devolve entidades de domínio, nunca o DTO de resposta HTTP. Mesma regra
   * de geração-na-primeira-leitura de getEvidencesForProfile.
   */
  async getEvidenceEntitiesForProfile(slug: string): Promise<Evidence[]> {
    const profile = await this.politicalProfilesService.findBySlugOrThrow(slug);
    return this.fetchEvidencesForProfile(profile);
  }

  /**
   * Gera Evidence na primeira leitura de um perfil e persiste (docs/SPECs/core/evidence.md#princípios:
   * "Nenhuma Evidence é removida fisicamente" — e, por extensão, nunca
   * regenerada por cima do que já existe). Único ponto de integração com o
   * Evidence Builder — quando existir uma fonte melhor (ETL rodando o
   * builder no momento da importação, por exemplo), só este método muda.
   */
  private async fetchEvidencesForProfile(profile: PoliticalProfileResult): Promise<Evidence[]> {
    const existing = await this.politicalEvidenceRepository.findByProfileId(profile.id);
    if (existing.length > 0) return existing;

    const [mandates, affiliations] = await Promise.all([
      this.politicalProfilesService.findMandatesByProfileId(profile.id),
      this.politicalProfilesService.findAffiliationsByProfileId(profile.id),
    ]);

    const drafts = buildEvidencesFromPoliticalProfile(profile, mandates, affiliations);
    if (drafts.length === 0) return [];

    return this.politicalEvidenceRepository.createMany(drafts);
  }
}
