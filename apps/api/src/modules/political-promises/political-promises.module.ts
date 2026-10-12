import { Module } from "@nestjs/common";

import { PoliticalProfilesModule } from "../political-profiles/political-profiles.module";
import { PoliticalPromisesController } from "./political-promises.controller";
import { PoliticalPromisesService } from "./political-promises.service";

@Module({
  imports: [PoliticalProfilesModule],
  controllers: [PoliticalPromisesController],
  providers: [PoliticalPromisesService],
})
export class PoliticalPromisesModule {}
