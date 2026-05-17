import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { PartiesService } from "./parties.service";

@ApiTags("parties")
@Controller("parties")
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Get()
  @ApiOperation({ summary: "Lista todos os partidos" })
  findAll() {
    return this.partiesService.findAll();
  }

  @Get(":acronym")
  @ApiOperation({ summary: "Retorna partido pelo acrônimo" })
  findOne(@Param("acronym") acronym: string) {
    return this.partiesService.findByAcronymOrThrow(acronym);
  }
}
