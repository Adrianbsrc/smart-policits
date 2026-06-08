import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import type { PaginatedResponse } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../auth/auth.guard";
import { PromisesService } from "./promises.service";
import { ListPromisesDto } from "./dto/list-promises.dto";
import { CreatePromiseDto } from "./dto/create-promise.dto";
import type { PromiseResult } from "./promises.repository";

@ApiTags("promises")
@Controller("politicians/:slug/promises")
export class PromisesController {
  constructor(private readonly promisesService: PromisesService) {}

  @Get()
  @ApiOperation({ summary: "Lista promessas políticas" })
  @ApiParam({ name: "slug" })
  list(@Param("slug") slug: string, @Query() query: ListPromisesDto): Promise<PaginatedResponse<PromiseResult>> {
    return this.promisesService.list(slug, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Cria promessa política (admin)" })
  @ApiParam({ name: "slug" })
  create(@Param("slug") slug: string, @Body() dto: CreatePromiseDto): Promise<PromiseResult> {
    return this.promisesService.create(slug, dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Atualiza status de promessa (admin)" })
  @ApiParam({ name: "slug" })
  @ApiParam({ name: "id" })
  update(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Body() dto: Partial<CreatePromiseDto> & { resolvedAt?: string },
  ): Promise<PromiseResult> {
    return this.promisesService.update(slug, id, dto);
  }
}
