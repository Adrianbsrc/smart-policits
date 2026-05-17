import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";

import type { UserResult } from "../users/users.repository";
import { UsersService } from "../users/users.service";
import { getAdminClient } from "./supabase-admin";

export interface AuthenticatedRequest extends Request {
  user: UserResult;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException("Token não fornecido");

    const supabase = getAdminClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException("Token inválido ou expirado");
    }

    const { id, email, user_metadata } = data.user;

    const user = await this.usersService.upsertBySupabaseId(id, {
      email: email ?? "",
      name: (user_metadata?.["name"] as string | undefined),
    });

    request.user = user;
    return true;
  }

  private extractToken(request: Request): string | undefined {
    const auth = request.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return undefined;
    return auth.slice(7);
  }
}
