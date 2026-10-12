import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePoliticalAffiliationDto {
  @ApiProperty()
  @IsString()
  profileId: string;

  @ApiProperty()
  @IsString()
  partyId: string;

  @ApiProperty({ example: "2019-01-01" })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: "2023-01-01" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiPropertyOptional({ example: "Mudança de partido por divergências programáticas" })
  @IsOptional()
  @IsString()
  reason?: string;
}
