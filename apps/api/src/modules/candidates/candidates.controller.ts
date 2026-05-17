import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { CandidatesService } from "./candidates.service";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { ListCandidatesDto } from "./dto/list-candidates.dto";

@ApiTags("candidates")
@Controller("candidates")
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  @ApiOperation({ summary: "Lista candidatos com filtros e paginação" })
  findAll(@Query() query: ListCandidatesDto) {
    return this.candidatesService.findAll(query);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Retorna perfil de candidato pelo slug" })
  findOne(@Param("slug") slug: string) {
    return this.candidatesService.findBySlugOrThrow(slug);
  }

  @Get(":slug/camara/votacoes")
  @ApiOperation({ summary: "Retorna votações do deputado na Câmara dos Deputados" })
  getCamaraVotacoes(@Param("slug") slug: string) {
    return this.candidatesService.getCamaraVotacoes(slug);
  }

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: "Cria candidato (admin)" })
  create(@Body() dto: CreateCandidateDto) {
    return this.candidatesService.create(dto);
  }
}
