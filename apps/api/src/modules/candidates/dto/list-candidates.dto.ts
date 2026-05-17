import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Office } from "@smart-politics/db";

import { PaginationDto } from "../../../common/dto/pagination.dto";

export class ListCandidatesDto extends PaginationDto {
  @ApiPropertyOptional({ enum: Office })
  @IsOptional()
  @IsEnum(Office)
  office?: Office;

  @ApiPropertyOptional({ example: "SP", maxLength: 2 })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;

  @ApiPropertyOptional({ example: "PT" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  party?: string;

  @ApiPropertyOptional({ example: "Lula" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
