import { Module } from "@nestjs/common";

import { CamaraApiService } from "../etl/camara-api.service";
import { CandidatesController } from "./candidates.controller";
import { CandidatesRepository } from "./candidates.repository";
import { CandidatesService } from "./candidates.service";

@Module({
  controllers: [CandidatesController],
  providers: [CandidatesService, CandidatesRepository, CamaraApiService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
