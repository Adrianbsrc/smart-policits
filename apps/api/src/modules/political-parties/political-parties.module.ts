import { Module } from "@nestjs/common";

import { PoliticalPartiesController } from "./political-parties.controller";
import { PoliticalPartiesRepository } from "./political-parties.repository";
import { PoliticalPartiesService } from "./political-parties.service";

@Module({
  controllers: [PoliticalPartiesController],
  providers: [PoliticalPartiesService, PoliticalPartiesRepository],
  exports: [PoliticalPartiesService],
})
export class PoliticalPartiesModule {}
