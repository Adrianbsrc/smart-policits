import { Module } from "@nestjs/common";

import { PoliticiansController } from "./politicians.controller";
import { PoliticiansRepository } from "./politicians.repository";
import { PoliticiansService } from "./politicians.service";

@Module({
  controllers: [PoliticiansController],
  providers: [PoliticiansService, PoliticiansRepository],
  exports: [PoliticiansService],
})
export class PoliticiansModule {}
