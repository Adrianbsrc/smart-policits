import { Module } from "@nestjs/common";

import { CamaraApiService } from "../etl/camara-api.service";
import { PoliticiansController } from "./politicians.controller";
import { PoliticiansRepository } from "./politicians.repository";
import { PoliticiansService } from "./politicians.service";

@Module({
  controllers: [PoliticiansController],
  providers: [PoliticiansService, PoliticiansRepository, CamaraApiService],
  exports: [PoliticiansService],
})
export class PoliticiansModule {}
