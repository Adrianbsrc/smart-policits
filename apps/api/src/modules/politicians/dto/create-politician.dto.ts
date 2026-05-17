import { IsEnum, IsOptional, IsString, IsUrl } from "class-validator";
import { Office } from "@smart-politics/db";

export class CreatePoliticianDto {
  @IsString()
  name: string;

  @IsEnum(Office)
  office: Office;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  partyId?: string;

  @IsUrl()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  tseId?: string;
}
