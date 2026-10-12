import { Module } from "@nestjs/common";

import { PoliticalOfficesModule } from "../political-offices/political-offices.module";
import { PoliticalProfilesModule } from "../political-profiles/political-profiles.module";
import { MandatesController } from "./mandates.controller";
import { MandatesRepository } from "./mandates.repository";
import { MandatesService } from "./mandates.service";

@Module({
  imports: [PoliticalProfilesModule, PoliticalOfficesModule],
  controllers: [MandatesController],
  providers: [MandatesService, MandatesRepository],
  exports: [MandatesService],
})
export class MandatesModule {}
