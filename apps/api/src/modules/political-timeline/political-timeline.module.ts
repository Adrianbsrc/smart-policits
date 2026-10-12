import { Module } from "@nestjs/common";

import { PoliticalEvidenceModule } from "../political-evidence/political-evidence.module";
import { PoliticalTimelineController } from "./political-timeline.controller";
import { PoliticalTimelineService } from "./political-timeline.service";

/**
 * Depende só de PoliticalEvidenceModule — Timeline não busca mais
 * Mandate/PoliticalAffiliation diretamente, então PoliticalProfilesModule
 * não precisa ser importado aqui (PoliticalEvidenceService já o usa
 * internamente para resolver o perfil e gerar Evidence na primeira leitura).
 */
@Module({
  imports: [PoliticalEvidenceModule],
  controllers: [PoliticalTimelineController],
  providers: [PoliticalTimelineService],
})
export class PoliticalTimelineModule {}
