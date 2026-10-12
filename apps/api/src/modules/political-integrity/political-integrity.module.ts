import { Module } from "@nestjs/common";

import { PoliticalProfilesModule } from "../political-profiles/political-profiles.module";
import { PoliticalIntegrityController } from "./political-integrity.controller";
import { PoliticalIntegrityService } from "./political-integrity.service";

@Module({
  imports: [PoliticalProfilesModule],
  controllers: [PoliticalIntegrityController],
  providers: [PoliticalIntegrityService],
})
export class PoliticalIntegrityModule {}
