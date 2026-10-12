import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

import { PoliticalIndicatorsService } from "./political-indicators.service";
import { IndicatorResponseDto } from "./dto/indicator-response.dto";

@ApiTags("political-indicators")
@Controller("profiles")
export class PoliticalIndicatorsController {
  constructor(private readonly politicalIndicatorsService: PoliticalIndicatorsService) {}

  @Get(":slug/indicators")
  @ApiOperation({ summary: "Lista os indicadores do perfil político" })
  @ApiParam({ name: "slug" })
  @ApiOkResponse({ type: [IndicatorResponseDto] })
  getIndicators(@Param("slug") slug: string): Promise<IndicatorResponseDto[]> {
    return this.politicalIndicatorsService.getIndicators(slug);
  }
}
