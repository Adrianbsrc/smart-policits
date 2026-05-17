import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import type { PaginatedResponse } from "../../common/dto/pagination.dto";
import type { CamaraVoto } from "../etl/camara-api.service";
import { PoliticiansService } from "./politicians.service";
import { CreatePoliticianDto } from "./dto/create-politician.dto";
import { ListPoliticiansDto } from "./dto/list-politicians.dto";
import type { PoliticianResult } from "./politicians.repository";

@ApiTags("politicians")
@Controller("politicians")
export class PoliticiansController {
  constructor(private readonly politiciansService: PoliticiansService) {}

  @Get()
  @ApiOperation({ summary: "Lista políticos com filtros e paginação" })
  findAll(@Query() query: ListPoliticiansDto): Promise<PaginatedResponse<PoliticianResult>> {
    return this.politiciansService.findAll(query);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Retorna perfil do político pelo slug" })
  findOne(@Param("slug") slug: string): Promise<PoliticianResult> {
    return this.politiciansService.findBySlugOrThrow(slug);
  }

  @Get(":slug/camara/votacoes")
  @ApiOperation({ summary: "Retorna votações do deputado na Câmara dos Deputados" })
  getCamaraVotacoes(@Param("slug") slug: string): Promise<{ dados: CamaraVoto[] }> {
    return this.politiciansService.getCamaraVotacoes(slug);
  }

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Cria político (admin)" })
  create(@Body() dto: CreatePoliticianDto): Promise<PoliticianResult> {
    return this.politiciansService.create(dto);
  }
}
