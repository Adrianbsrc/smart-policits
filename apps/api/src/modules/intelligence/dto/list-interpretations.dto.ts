import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

import { InputTypeEnum } from "./interpret.dto";

export class ListInterpretationsDto {
  @ApiPropertyOptional({ enum: InputTypeEnum })
  @IsEnum(InputTypeEnum)
  @IsOptional()
  inputType?: InputTypeEnum;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  skip?: number = 0;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  take?: number = 20;
}
