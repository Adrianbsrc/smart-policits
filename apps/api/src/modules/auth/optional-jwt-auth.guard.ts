import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

import type { UserResult } from "../users/users.repository";
import { UsersService } from "../users/users.service";

interface SupabaseJwtPayload {
  sub: string;
  email: string;
  user_metadata?: { name?: string; avatar_url?: string };
  aud: string;
  role: string;
  exp: number;
}

export interface MaybeAuthenticatedRequest extends Request {
  user?: UserResult;
}

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<MaybeAuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) return true;

    let payload: SupabaseJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<SupabaseJwtPayload>(token, {
        secret: process.env["SUPABASE_JWT_SECRET"],
        ignoreExpiration: false,
      });
    } catch {
      return true;
    }

    const user = await this.usersService.upsertBySupabaseId(payload.sub, {
      email: payload.email,
      name: payload.user_metadata?.name,
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
