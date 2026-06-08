import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum ExpenseCategoryQuery {
  travel = "travel",
  office = "office",
  fuel = "fuel",
  consultancy = "consultancy",
  publicity = "publicity",
  other = "other",
}

export class ListExpensesDto {
  @ApiPropertyOptional({ description: "Ano do gasto" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ description: "Mês (1-12)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ enum: ExpenseCategoryQuery })
  @IsOptional()
  @IsEnum(ExpenseCategoryQuery)
  category?: ExpenseCategoryQuery;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 30, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 30;
}
