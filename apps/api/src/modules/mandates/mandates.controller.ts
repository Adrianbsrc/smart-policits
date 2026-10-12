import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { MandatesService } from "./mandates.service";
import { CreateMandateDto } from "./dto/create-mandate.dto";
import { UpdateMandateDto } from "./dto/update-mandate.dto";
import type { MandateResult } from "./mandates.repository";

@ApiTags("mandates")
@Controller("mandates")
export class MandatesController {
  constructor(private readonly mandatesService: MandatesService) {}

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Cria mandato para um perfil político" })
  create(@Body() dto: CreateMandateDto): Promise<MandateResult> {
    return this.mandatesService.create(dto);
  }

  @Put(":id")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Atualiza mandato" })
  @ApiParam({ name: "id" })
  update(@Param("id") id: string, @Body() dto: UpdateMandateDto): Promise<MandateResult> {
    return this.mandatesService.update(id, dto);
  }

  @Delete(":id")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Remove mandato" })
  @ApiParam({ name: "id" })
  remove(@Param("id") id: string): Promise<MandateResult> {
    return this.mandatesService.delete(id);
  }
}
