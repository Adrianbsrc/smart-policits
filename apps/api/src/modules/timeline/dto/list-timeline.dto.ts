import { IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum PoliticalEventTypeQuery {
  vote = "vote",
  bill_proposed = "bill_proposed",
  bill_approved = "bill_approved",
  investigation = "investigation",
  decree = "decree",
  public_expense = "public_expense",
  statement = "statement",
}

export class ListTimelineDto {
  @ApiPropertyOptional({ enum: PoliticalEventTypeQuery })
  @IsOptional()
  @IsEnum(PoliticalEventTypeQuery)
  type?: PoliticalEventTypeQuery;

  @ApiPropertyOptional({ description: "Data de início (ISO 8601)" })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: "Data de fim (ISO 8601)" })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
