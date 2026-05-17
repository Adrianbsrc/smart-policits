import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { UsersModule } from "../users/users.module";
import { JwtAuthGuard } from "./auth.guard";
import { OptionalJwtAuthGuard } from "./optional-jwt-auth.guard";

@Module({
  imports: [
    JwtModule.register({}),
    forwardRef(() => UsersModule),
  ],
  providers: [JwtAuthGuard, OptionalJwtAuthGuard],
  exports: [JwtAuthGuard, OptionalJwtAuthGuard, JwtModule, forwardRef(() => UsersModule)],
})
export class AuthModule {}
