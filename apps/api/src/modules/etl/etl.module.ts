import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { IntelligenceModule } from "../intelligence/intelligence.module";
import { EtlController } from "./etl.controller";
import { EtlService } from "./etl.service";

@Module({
  imports: [AuthModule, IntelligenceModule],
  controllers: [EtlController],
  providers: [EtlService],
})
export class EtlModule {}
