import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum InputTypeEnum {
  BILL = "bill",
  VOTE = "vote",
  DECREE = "decree",
  EXECUTIVE_ACTION = "executive_action",
  NEWS = "news",
  SPENDING = "spending",
}

export class InterpretDto {
  @ApiProperty({ enum: InputTypeEnum, description: "Tipo do evento político" })
  @IsEnum(InputTypeEnum)
  type: InputTypeEnum;

  @ApiProperty({ description: "Título do evento" })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;

  @ApiProperty({ description: "Descrição detalhada" })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional({ description: "Data do evento (ISO 8601)" })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: "Slugs dos políticos envolvidos" })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  politicians?: string[];
}
