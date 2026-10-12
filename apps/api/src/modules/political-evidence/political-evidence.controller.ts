import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

import { PoliticalEvidenceService } from "./political-evidence.service";
import { EvidenceResponseDto } from "./dto/evidence-response.dto";

@ApiTags("political-evidence")
@Controller()
export class PoliticalEvidenceController {
  constructor(private readonly politicalEvidenceService: PoliticalEvidenceService) {}

  @Get("profiles/:slug/evidences")
  @ApiOperation({ summary: "Lista as evidências do perfil político" })
  @ApiParam({ name: "slug" })
  @ApiOkResponse({ type: [EvidenceResponseDto] })
  getEvidencesForProfile(@Param("slug") slug: string): Promise<EvidenceResponseDto[]> {
    return this.politicalEvidenceService.getEvidencesForProfile(slug);
  }

  @Get("evidences/:id")
  @ApiOperation({ summary: "Detalha uma Evidence por id" })
  @ApiParam({ name: "id" })
  @ApiOkResponse({ type: EvidenceResponseDto })
  getEvidenceById(@Param("id") id: string): Promise<EvidenceResponseDto> {
    return this.politicalEvidenceService.getEvidenceById(id);
  }
}
