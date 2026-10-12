import { Module } from "@nestjs/common";

import { PoliticalProfilesController } from "./political-profiles.controller";
import { PoliticalProfilesRepository } from "./political-profiles.repository";
import { PoliticalProfilesService } from "./political-profiles.service";

@Module({
  controllers: [PoliticalProfilesController],
  providers: [PoliticalProfilesService, PoliticalProfilesRepository],
  exports: [PoliticalProfilesService],
})
export class PoliticalProfilesModule {}
