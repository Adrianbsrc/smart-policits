import { Module } from "@nestjs/common";

import { PoliticalProfilesModule } from "../political-profiles/political-profiles.module";
import { PoliticalEvidenceController } from "./political-evidence.controller";
import { PoliticalEvidenceRepository } from "./political-evidence.repository";
import { PoliticalEvidenceService } from "./political-evidence.service";

/**
 * Domínio central da plataforma (docs/SPECs/core/evidence.md). Exporta
 * PoliticalEvidenceService para que outros módulos consumam Evidence
 * diretamente em vez de manter suas próprias fontes de fatos —
 * PoliticalTimelineModule já faz isso (importa este módulo e chama
 * getEvidenceEntitiesForProfile). Promises, Integrity e Assessment são os
 * próximos candidatos.
 */
@Module({
  imports: [PoliticalProfilesModule],
  controllers: [PoliticalEvidenceController],
  providers: [PoliticalEvidenceService, PoliticalEvidenceRepository],
  exports: [PoliticalEvidenceService],
})
export class PoliticalEvidenceModule {}
