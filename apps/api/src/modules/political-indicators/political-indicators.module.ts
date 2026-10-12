import { Module } from "@nestjs/common";

import { PoliticalProfilesModule } from "../political-profiles/political-profiles.module";
import { PoliticalIndicatorsController } from "./political-indicators.controller";
import { PoliticalIndicatorsService } from "./political-indicators.service";

@Module({
  imports: [PoliticalProfilesModule],
  controllers: [PoliticalIndicatorsController],
  providers: [PoliticalIndicatorsService],
})
export class PoliticalIndicatorsModule {}
