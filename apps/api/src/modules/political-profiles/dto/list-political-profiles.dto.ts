import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PoliticalProfileStatus } from "@smart-politics/db";

import { PaginationDto } from "../../../common/dto/pagination.dto";

export class ListPoliticalProfilesDto extends PaginationDto {
  @ApiPropertyOptional({ enum: PoliticalProfileStatus })
  @IsOptional()
  @IsEnum(PoliticalProfileStatus)
  status?: PoliticalProfileStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  partyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  officeId?: string;

  @ApiPropertyOptional({ example: "Lula" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
