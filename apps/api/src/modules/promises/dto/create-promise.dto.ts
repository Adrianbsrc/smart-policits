import { IsDateString, IsEnum, IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum PromiseStatusCreate {
  in_progress = "in_progress",
  fulfilled = "fulfilled",
  partial = "partial",
  not_fulfilled = "not_fulfilled",
  abandoned = "abandoned",
}

export class CreatePromiseDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(300)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ enum: PromiseStatusCreate, default: PromiseStatusCreate.in_progress })
  @IsEnum(PromiseStatusCreate)
  status: PromiseStatusCreate = PromiseStatusCreate.in_progress;

  @ApiProperty({ description: "Categoria temática (education, health, security, etc.)" })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  category: string;

  @ApiPropertyOptional({ description: "Data em que a promessa foi feita (ISO 8601)" })
  @IsOptional()
  @IsDateString()
  madeAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  evidenceUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
