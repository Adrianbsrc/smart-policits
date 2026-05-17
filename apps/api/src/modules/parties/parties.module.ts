import { Module } from "@nestjs/common";

import { PrismaModule } from "../../config/prisma.module";
import { PartiesController } from "./parties.controller";
import { PartiesRepository } from "./parties.repository";
import { PartiesService } from "./parties.service";

@Module({
  imports: [PrismaModule],
  controllers: [PartiesController],
  providers: [PartiesService, PartiesRepository],
  exports: [PartiesService],
})
export class PartiesModule {}
