import { IsEnum, IsInt, IsString, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PoliticalOfficeScope, PoliticalOfficeType } from "@smart-politics/db";

export class CreatePoliticalOfficeDto {
  @ApiProperty({ enum: PoliticalOfficeType, example: PoliticalOfficeType.president })
  @IsEnum(PoliticalOfficeType)
  type: PoliticalOfficeType;

  @ApiProperty({ example: "Presidente da República" })
  @IsString()
  name: string;

  @ApiProperty({ enum: PoliticalOfficeScope, example: PoliticalOfficeScope.national })
  @IsEnum(PoliticalOfficeScope)
  scope: PoliticalOfficeScope;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  termYears: number;
}
