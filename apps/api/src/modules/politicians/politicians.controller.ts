import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import type { PaginatedResponse } from "../../common/dto/pagination.dto";
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
  getCamaraVotacoes(@Param("slug") slug: string): Promise<{ dados: unknown[] }> {
    return this.politiciansService.getCamaraVotacoes(slug);
  }

  @Get(":slug/score-history")
  @ApiOperation({ summary: "Histórico de scores do político" })
  @ApiParam({ name: "slug" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  getScoreHistory(
    @Param("slug") slug: string,
    @Query("limit", new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ) {
    return this.politiciansService.getScoreHistory(slug, limit);
  }

  @Get(":slug/score-evidence")
  @ApiOperation({ summary: "Evidências que justificam o score do político" })
  @ApiParam({ name: "slug" })
  @ApiQuery({ name: "dimension", required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  getScoreEvidence(
    @Param("slug") slug: string,
    @Query("dimension") dimension?: string,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.politiciansService.getScoreEvidence(slug, dimension, limit);
  }

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Cria político (admin)" })
  create(@Body() dto: CreatePoliticianDto): Promise<PoliticianResult> {
    return this.politiciansService.create(dto);
  }
}
