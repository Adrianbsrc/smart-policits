import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

import { PoliticalIntegrityService } from "./political-integrity.service";
import { IntegrityRecordResponseDto } from "./dto/integrity-record-response.dto";

@ApiTags("political-integrity")
@Controller("profiles")
export class PoliticalIntegrityController {
  constructor(private readonly politicalIntegrityService: PoliticalIntegrityService) {}

  @Get(":slug/integrity")
  @ApiOperation({ summary: "Lista os registros de integridade pública do perfil político" })
  @ApiParam({ name: "slug" })
  @ApiOkResponse({ type: [IntegrityRecordResponseDto] })
  getIntegrityRecords(@Param("slug") slug: string): Promise<IntegrityRecordResponseDto[]> {
    return this.politicalIntegrityService.getIntegrityRecords(slug);
  }
}
