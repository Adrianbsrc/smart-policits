import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { PoliticalPartiesService } from "./political-parties.service";
import { CreatePoliticalPartyDto } from "./dto/create-political-party.dto";
import { UpdatePoliticalPartyDto } from "./dto/update-political-party.dto";
import type { PoliticalPartyResult } from "./political-parties.repository";

@ApiTags("political-parties")
@Controller("political-parties")
export class PoliticalPartiesController {
  constructor(private readonly politicalPartiesService: PoliticalPartiesService) {}

  @Get()
  @ApiOperation({ summary: "Lista todos os partidos políticos" })
  findAll(): Promise<PoliticalPartyResult[]> {
    return this.politicalPartiesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Retorna partido político pelo id" })
  @ApiParam({ name: "id" })
  findOne(@Param("id") id: string): Promise<PoliticalPartyResult> {
    return this.politicalPartiesService.findByIdOrThrow(id);
  }

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Cria partido político" })
  create(@Body() dto: CreatePoliticalPartyDto): Promise<PoliticalPartyResult> {
    return this.politicalPartiesService.create(dto);
  }

  @Put(":id")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Atualiza partido político" })
  @ApiParam({ name: "id" })
  update(@Param("id") id: string, @Body() dto: UpdatePoliticalPartyDto): Promise<PoliticalPartyResult> {
    return this.politicalPartiesService.update(id, dto);
  }

  @Delete(":id")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Remove partido político" })
  @ApiParam({ name: "id" })
  remove(@Param("id") id: string): Promise<PoliticalPartyResult> {
    return this.politicalPartiesService.delete(id);
  }
}
