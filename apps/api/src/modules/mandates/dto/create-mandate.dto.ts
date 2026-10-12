import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ElectoralResult } from "@smart-politics/db";

export class CreateMandateDto {
  @ApiProperty()
  @IsString()
  profileId: string;

  @ApiProperty()
  @IsString()
  officeId: string;

  @ApiProperty({ example: "2023-01-01" })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: "2027-01-01" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  reelected?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 2022 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  electionYear?: number;

  @ApiPropertyOptional({ example: 2, description: "1º ou 2º turno" })
  @IsOptional()
  @IsInt()
  @Min(1)
  electionRound?: number;

  @ApiPropertyOptional({ example: 58366424 })
  @IsOptional()
  @IsInt()
  @Min(0)
  votes?: number;

  @ApiPropertyOptional({ enum: ElectoralResult })
  @IsOptional()
  @IsEnum(ElectoralResult)
  electoralResult?: ElectoralResult;

  @ApiPropertyOptional({ example: "election" })
  @IsOptional()
  @IsString()
  startReason?: string;

  @ApiPropertyOptional({ example: "term_end" })
  @IsOptional()
  @IsString()
  endReason?: string;

  @ApiPropertyOptional({ description: "Id do PoliticalProfile do vice/suplente na chapa" })
  @IsOptional()
  @IsString()
  viceProfileId?: string;
}
