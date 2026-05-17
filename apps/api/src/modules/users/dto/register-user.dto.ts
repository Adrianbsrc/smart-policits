import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class RegisterUserDto {
  @IsString()
  @IsUUID()
  supabaseId: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
