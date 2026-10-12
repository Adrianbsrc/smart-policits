import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUrl } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PoliticalProfileStatus } from "@smart-politics/db";

export class CreatePoliticalProfileDto {
  @ApiProperty({ example: "Luiz Inácio Lula da Silva" })
  @IsString()
  fullName: string;

  @ApiProperty({ example: "Lula" })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ example: "35º Presidente da República Federativa do Brasil." })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  photo?: string;

  @ApiPropertyOptional({ example: "1945-10-27" })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: "Caetés, PE" })
  @IsOptional()
  @IsString()
  birthPlace?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentOfficeId?: string;

  @ApiPropertyOptional({ enum: PoliticalProfileStatus })
  @IsOptional()
  @IsEnum(PoliticalProfileStatus)
  status?: PoliticalProfileStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCandidate?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isIncumbent?: boolean;
}
