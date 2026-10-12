import { Module } from "@nestjs/common";

import { PoliticalPartiesModule } from "../political-parties/political-parties.module";
import { PoliticalProfilesModule } from "../political-profiles/political-profiles.module";
import { PoliticalAffiliationsController } from "./political-affiliations.controller";
import { PoliticalAffiliationsRepository } from "./political-affiliations.repository";
import { PoliticalAffiliationsService } from "./political-affiliations.service";

@Module({
  imports: [PoliticalProfilesModule, PoliticalPartiesModule],
  controllers: [PoliticalAffiliationsController],
  providers: [PoliticalAffiliationsService, PoliticalAffiliationsRepository],
  exports: [PoliticalAffiliationsService],
})
export class PoliticalAffiliationsModule {}
