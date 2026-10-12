import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

import { PoliticalPromisesService } from "./political-promises.service";
import { PromiseResponseDto } from "./dto/promise-response.dto";

@ApiTags("political-promises")
@Controller("profiles")
export class PoliticalPromisesController {
  constructor(private readonly politicalPromisesService: PoliticalPromisesService) {}

  @Get(":slug/promises")
  @ApiOperation({ summary: "Lista as promessas do perfil político" })
  @ApiParam({ name: "slug" })
  @ApiOkResponse({ type: [PromiseResponseDto] })
  getPromises(@Param("slug") slug: string): Promise<PromiseResponseDto[]> {
    return this.politicalPromisesService.getPromises(slug);
  }
}
