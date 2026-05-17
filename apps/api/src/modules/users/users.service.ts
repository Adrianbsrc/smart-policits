import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import type { UserResult } from "./users.repository";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findAll(): Promise<UserResult[]> {
    return this.usersRepository.findAll();
  }

  async findOneOrThrow(id: string): Promise<UserResult> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`Usuário ${id} não encontrado`);
    return user;
  }

  async create(supabaseId: string, dto: CreateUserDto): Promise<UserResult> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException("E-mail já cadastrado");
    return this.usersRepository.create(supabaseId, dto);
  }

  upsertBySupabaseId(
    supabaseId: string,
    data: { email: string; name?: string },
  ): Promise<UserResult> {
    return this.usersRepository.upsertBySupabaseId(supabaseId, data);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResult> {
    await this.findOneOrThrow(id);
    return this.usersRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findOneOrThrow(id);
    await this.usersRepository.delete(id);
  }
}
