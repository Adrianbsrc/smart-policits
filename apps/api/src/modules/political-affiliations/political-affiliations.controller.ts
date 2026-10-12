import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { PoliticalAffiliationsService } from "./political-affiliations.service";
import { CreatePoliticalAffiliationDto } from "./dto/create-political-affiliation.dto";
import { UpdatePoliticalAffiliationDto } from "./dto/update-political-affiliation.dto";
import type { PoliticalAffiliationResult } from "./political-affiliations.repository";

@ApiTags("political-affiliations")
@Controller("political-affiliations")
export class PoliticalAffiliationsController {
  constructor(private readonly politicalAffiliationsService: PoliticalAffiliationsService) {}

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Cria filiação partidária para um perfil político" })
  create(@Body() dto: CreatePoliticalAffiliationDto): Promise<PoliticalAffiliationResult> {
    return this.politicalAffiliationsService.create(dto);
  }

  @Put(":id")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Atualiza filiação partidária" })
  @ApiParam({ name: "id" })
  update(@Param("id") id: string, @Body() dto: UpdatePoliticalAffiliationDto): Promise<PoliticalAffiliationResult> {
    return this.politicalAffiliationsService.update(id, dto);
  }

  @Delete(":id")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Remove filiação partidária" })
  @ApiParam({ name: "id" })
  remove(@Param("id") id: string): Promise<PoliticalAffiliationResult> {
    return this.politicalAffiliationsService.delete(id);
  }
}
