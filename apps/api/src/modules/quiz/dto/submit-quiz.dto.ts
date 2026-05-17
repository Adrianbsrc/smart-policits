import { IsNotEmpty, IsObject } from "class-validator";

export class SubmitQuizDto {
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, string>;
}
