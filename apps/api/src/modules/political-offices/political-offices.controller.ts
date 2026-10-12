import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { PoliticalOfficesService } from "./political-offices.service";
import { CreatePoliticalOfficeDto } from "./dto/create-political-office.dto";
import { UpdatePoliticalOfficeDto } from "./dto/update-political-office.dto";
import type { PoliticalOfficeResult } from "./political-offices.repository";

@ApiTags("political-offices")
@Controller("political-offices")
export class PoliticalOfficesController {
  constructor(private readonly politicalOfficesService: PoliticalOfficesService) {}

  @Get()
  @ApiOperation({ summary: "Lista todos os cargos políticos" })
  findAll(): Promise<PoliticalOfficeResult[]> {
    return this.politicalOfficesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Retorna cargo político pelo id" })
  @ApiParam({ name: "id" })
  findOne(@Param("id") id: string): Promise<PoliticalOfficeResult> {
    return this.politicalOfficesService.findByIdOrThrow(id);
  }

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Cria cargo político" })
  create(@Body() dto: CreatePoliticalOfficeDto): Promise<PoliticalOfficeResult> {
    return this.politicalOfficesService.create(dto);
  }

  @Put(":id")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Atualiza cargo político" })
  @ApiParam({ name: "id" })
  update(@Param("id") id: string, @Body() dto: UpdatePoliticalOfficeDto): Promise<PoliticalOfficeResult> {
    return this.politicalOfficesService.update(id, dto);
  }

  @Delete(":id")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Remove cargo político" })
  @ApiParam({ name: "id" })
  remove(@Param("id") id: string): Promise<PoliticalOfficeResult> {
    return this.politicalOfficesService.delete(id);
  }
}
