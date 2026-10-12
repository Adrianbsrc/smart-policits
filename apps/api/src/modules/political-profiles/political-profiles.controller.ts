import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import type { PaginatedResponse } from "../../common/dto/pagination.dto";
import { PoliticalProfilesService } from "./political-profiles.service";
import { CreatePoliticalProfileDto } from "./dto/create-political-profile.dto";
import { ListPoliticalProfilesDto } from "./dto/list-political-profiles.dto";
import { UpdatePoliticalProfileDto } from "./dto/update-political-profile.dto";
import { ExecutiveSummaryResponseDto } from "./dto/executive-summary-response.dto";
import type { AffiliationWithParty, MandateWithOffice, PoliticalProfileResult } from "./political-profiles.repository";

@ApiTags("political-profiles")
@Controller("profiles")
export class PoliticalProfilesController {
  constructor(private readonly politicalProfilesService: PoliticalProfilesService) {}

  @Get()
  @ApiOperation({ summary: "Lista perfis políticos com filtros e paginação" })
  findAll(@Query() query: ListPoliticalProfilesDto): Promise<PaginatedResponse<PoliticalProfileResult>> {
    return this.politicalProfilesService.findAll(query);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Retorna perfil político pelo slug" })
  @ApiParam({ name: "slug" })
  findOne(@Param("slug") slug: string): Promise<PoliticalProfileResult> {
    return this.politicalProfilesService.findBySlugOrThrow(slug);
  }

  @Get(":slug/mandates")
  @ApiOperation({ summary: "Lista os mandatos do perfil político" })
  @ApiParam({ name: "slug" })
  findMandates(@Param("slug") slug: string): Promise<MandateWithOffice[]> {
    return this.politicalProfilesService.findMandatesBySlug(slug);
  }

  @Get(":slug/affiliations")
  @ApiOperation({ summary: "Lista o histórico de filiações partidárias do perfil político" })
  @ApiParam({ name: "slug" })
  findAffiliations(@Param("slug") slug: string): Promise<AffiliationWithParty[]> {
    return this.politicalProfilesService.findAffiliationsBySlug(slug);
  }

  @Get(":slug/executive-summary")
  @ApiOperation({ summary: "Resumo executivo do perfil político (identificação + experiência)" })
  @ApiParam({ name: "slug" })
  @ApiOkResponse({ type: ExecutiveSummaryResponseDto })
  getExecutiveSummary(@Param("slug") slug: string): Promise<ExecutiveSummaryResponseDto> {
    return this.politicalProfilesService.getExecutiveSummary(slug);
  }

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Cria perfil político" })
  create(@Body() dto: CreatePoliticalProfileDto): Promise<PoliticalProfileResult> {
    return this.politicalProfilesService.create(dto);
  }

  @Put(":id")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Atualiza perfil político" })
  @ApiParam({ name: "id" })
  update(@Param("id") id: string, @Body() dto: UpdatePoliticalProfileDto): Promise<PoliticalProfileResult> {
    return this.politicalProfilesService.update(id, dto);
  }

  @Delete(":id")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Remove perfil político" })
  @ApiParam({ name: "id" })
  remove(@Param("id") id: string): Promise<PoliticalProfileResult> {
    return this.politicalProfilesService.delete(id);
  }
}
