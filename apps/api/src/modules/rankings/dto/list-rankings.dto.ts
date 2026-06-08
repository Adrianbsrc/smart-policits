import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Office } from "@smart-politics/db";

import { PaginationDto } from "../../../common/dto/pagination.dto";

export class ListRankingsDto extends PaginationDto {
  /**
   * Filtro por cargo. Suporta múltiplos valores: ?office=federal_deputy&office=senator
   * Compatível também com valor único: ?office=federal_deputy
   */
  @ApiPropertyOptional({ enum: Office, isArray: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined))
  @IsArray()
  @IsEnum(Office, { each: true })
  office?: Office[];

  /** Suporta múltiplos estados: ?state=SP&state=RJ */
  @ApiPropertyOptional({ example: "SP", isArray: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2, { each: true })
  state?: string[];

  /** Suporta múltiplos partidos: ?party=PT&party=PL */
  @ApiPropertyOptional({ example: "PT", isArray: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  party?: string[];

  @ApiPropertyOptional({ example: "Lula" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  /** Filtrar apenas parlamentares com ficha limpa (fichaLimpaIneligible = false) */
  @ApiPropertyOptional({ type: Boolean, description: "Apenas ficha limpa" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  fichaLimpa?: boolean;

  /**
   * Filtrar estreantes: políticos no primeiro mandato (mandateCount <= 1)
   */
  @ApiPropertyOptional({ type: Boolean, description: "Apenas estreantes (1º mandato)" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  estreante?: boolean;

  /**
   * Filtrar reeleitos: políticos com 2+ mandatos (mandateCount >= 2)
   */
  @ApiPropertyOptional({ type: Boolean, description: "Apenas reeleitos (2+ mandatos)" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  reeleito?: boolean;

  /**
   * Filtrar veteranos: políticos com 3+ mandatos (mandateCount >= 3)
   */
  @ApiPropertyOptional({ type: Boolean, description: "Apenas veteranos (3+ mandatos)" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  veterano?: boolean;

  /**
   * Filtrar pré-candidatos: isPreCandidate = true
   */
  @ApiPropertyOptional({ type: Boolean, description: "Apenas pré-candidatos" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  preCandidate?: boolean;

  /** Ordenação: overall (padrão), transparency, activity, constitutional, integrityMultiplier */
  @ApiPropertyOptional({ enum: ["overall", "transparency", "activity", "constitutional", "integrityMultiplier"] })
  @IsOptional()
  @IsIn(["overall", "transparency", "activity", "constitutional", "integrityMultiplier"])
  sortBy?: "overall" | "transparency" | "activity" | "constitutional" | "integrityMultiplier";
}
