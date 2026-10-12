import { Module } from "@nestjs/common";

import { PoliticalOfficesController } from "./political-offices.controller";
import { PoliticalOfficesRepository } from "./political-offices.repository";
import { PoliticalOfficesService } from "./political-offices.service";

@Module({
  controllers: [PoliticalOfficesController],
  providers: [PoliticalOfficesService, PoliticalOfficesRepository],
  exports: [PoliticalOfficesService],
})
export class PoliticalOfficesModule {}
