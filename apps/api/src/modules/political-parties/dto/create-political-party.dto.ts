import { IsInt, IsOptional, IsString, IsUrl, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePoliticalPartyDto {
  @ApiProperty({ example: "Partido dos Trabalhadores" })
  @IsString()
  name: string;

  @ApiProperty({ example: "PT" })
  @IsString()
  acronym: string;

  @ApiPropertyOptional({ example: 13 })
  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logo?: string;
}
