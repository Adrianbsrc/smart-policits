import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { AssetsService } from "./assets.service";
import type { AssetDeclarationResult } from "./assets.repository";

@ApiTags("assets")
@Controller("politicians/:slug/assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: "Lista declarações de patrimônio do político" })
  @ApiParam({ name: "slug" })
  findAll(@Param("slug") slug: string): Promise<AssetDeclarationResult[]> {
    return this.assetsService.findAll(slug);
  }

  @Get(":year")
  @ApiOperation({ summary: "Declaração de patrimônio de um ano específico" })
  @ApiParam({ name: "slug" })
  @ApiParam({ name: "year", type: Number })
  findByYear(@Param("slug") slug: string, @Param("year", ParseIntPipe) year: number): Promise<AssetDeclarationResult> {
    return this.assetsService.findByYear(slug, year);
  }
}
