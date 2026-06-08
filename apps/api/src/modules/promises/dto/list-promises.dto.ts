import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum PromiseStatusQuery {
  in_progress = "in_progress",
  fulfilled = "fulfilled",
  partial = "partial",
  not_fulfilled = "not_fulfilled",
  abandoned = "abandoned",
}

export class ListPromisesDto {
  @ApiPropertyOptional({ enum: PromiseStatusQuery })
  @IsOptional()
  @IsEnum(PromiseStatusQuery)
  status?: PromiseStatusQuery;

  @ApiPropertyOptional()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
