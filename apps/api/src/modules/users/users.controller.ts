import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { RegisterUserDto } from "./dto/register-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import type { UserResult } from "./users.repository";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: RegisterUserDto) {
    const { supabaseId, ...userDto } = dto;
    return this.usersService.create(supabaseId, userDto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: UserResult) {
    return user;
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser() user: UserResult, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Delete("me")
  @UseGuards(JwtAuthGuard)
  async deleteMe(@CurrentUser() user: UserResult) {
    await this.usersService.remove(user.id);
    return { message: "Conta removida com sucesso" };
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOneOrThrow(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.usersService.remove(id);
    return { message: "Usuário removido" };
  }
}
