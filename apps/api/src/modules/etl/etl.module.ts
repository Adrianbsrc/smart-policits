import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { CamaraApiService } from "./camara-api.service";
import { EtlController } from "./etl.controller";
import { EtlService } from "./etl.service";

@Module({
  imports: [AuthModule],
  controllers: [EtlController],
  providers: [EtlService, CamaraApiService],
})
export class EtlModule {}
