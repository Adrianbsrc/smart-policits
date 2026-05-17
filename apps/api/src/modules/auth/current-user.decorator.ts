import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { UserResult } from "../users/users.repository";
import type { AuthenticatedRequest } from "./auth.guard";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserResult => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
