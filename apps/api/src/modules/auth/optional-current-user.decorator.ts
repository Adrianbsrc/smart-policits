import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { UserResult } from "../users/users.repository";
import type { MaybeAuthenticatedRequest } from "./optional-jwt-auth.guard";

export const OptionalCurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserResult | undefined => {
    const request = ctx.switchToHttp().getRequest<MaybeAuthenticatedRequest>();
    return request.user;
  },
);
