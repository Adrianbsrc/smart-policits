import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

import type { PaginatedResponse } from "../../common/dto/pagination.dto";
import { FeedService, type FeedCard, type StaticFeedCard } from "./feed.service";
import { CreateFeedItemDto } from "./dto/create-feed-item.dto";
import { UpdateFeedItemDto } from "./dto/update-feed-item.dto";

class FeedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}

@ApiTags("feed")
@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @ApiOperation({ summary: "Feed de destaques políticos e notícias" })
  getFeed(@Query() query: FeedQueryDto): Promise<PaginatedResponse<FeedCard>> {
    return this.feedService.getFeed(query.page, query.limit);
  }

  @Get("items")
  @ApiOperation({ summary: "Listar todos os feed items (admin)" })
  listFeedItems(@Query() query: FeedQueryDto): Promise<PaginatedResponse<StaticFeedCard>> {
    return this.feedService.listFeedItems(query.page, query.limit);
  }

  @Post("items")
  @ApiOperation({ summary: "Criar item de feed" })
  createFeedItem(@Body() dto: CreateFeedItemDto): Promise<StaticFeedCard> {
    return this.feedService.createFeedItem(dto);
  }

  @Patch("items/:id")
  @ApiOperation({ summary: "Atualizar item de feed" })
  updateFeedItem(
    @Param("id") id: string,
    @Body() dto: UpdateFeedItemDto,
  ): Promise<StaticFeedCard> {
    return this.feedService.updateFeedItem(id, dto);
  }

  @Delete("items/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover item de feed" })
  deleteFeedItem(@Param("id") id: string): Promise<void> {
    return this.feedService.deleteFeedItem(id);
  }
}
