import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

import type { UserResult } from "../users/users.repository";
import { UsersService } from "../users/users.service";
import { getAdminClient } from "./supabase-admin";

export interface MaybeAuthenticatedRequest extends Request {
  user?: UserResult;
}

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<MaybeAuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) return true;

    try {
      const { data, error } = await getAdminClient().auth.getUser(token);
      if (error || !data.user) return true;

      const { id, email, user_metadata } = data.user;
      const user = await this.usersService.upsertBySupabaseId(id, {
        email: email ?? "",
        name: (user_metadata?.["name"] as string | undefined),
      });
      request.user = user;
    } catch {
      // optional — let the request through without a user
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const auth = request.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return undefined;
    return auth.slice(7);
  }
}
