import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsEnum, IsObject, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export enum ManualFeedItemType {
  news = "news",
  law_update = "law_update",
  poll = "poll",
  generic = "generic",
}

export class CreateFeedItemDto {
  @ApiProperty({ enum: ManualFeedItemType, description: "Tipo do item de feed (politician_spotlight é gerado automaticamente)" })
  @IsEnum(ManualFeedItemType)
  type: ManualFeedItemType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaUrl?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "ISO 8601 datetime. Default: now" })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ description: "ISO 8601 datetime. Null = never expires" })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  active?: boolean;

  @ApiPropertyOptional({ description: "ID do político relacionado (opcional)" })
  @IsOptional()
  @IsString()
  politicianId?: string;
}
