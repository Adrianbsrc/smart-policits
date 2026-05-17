import { Controller, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { JwtAuthGuard } from "../auth/auth.guard";
import { EtlService } from "./etl.service";

@ApiTags("etl")
@Controller("etl")
@UseGuards(JwtAuthGuard)
export class EtlController {
  constructor(private readonly etlService: EtlService) {}

  @Post("sync/camara")
  @Throttle({ default: { ttl: 60_000, limit: 2 } })
  @ApiOperation({ summary: "Sincroniza deputados federais da Câmara dos Deputados (admin)" })
  syncCamara() {
    return this.etlService.syncCamaraDeputados();
  }

  @Post("sync/governors")
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: "Sincroniza governadores 2023-2027 (seed data)" })
  syncGovernors() {
    return this.etlService.syncGovernors();
  }

  @Post("sync/presidents")
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: "Sincroniza candidatos à presidência — eleição 2022 (seed data)" })
  syncPresidents() {
    return this.etlService.syncPresidents();
  }
}
