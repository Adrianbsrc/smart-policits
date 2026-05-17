import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/auth.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { OptionalCurrentUser } from "../auth/optional-current-user.decorator";
import type { UserResult } from "../users/users.repository";
import { FollowsService } from "./follows.service";

@ApiTags("follows")
@ApiBearerAuth()
@Controller("follows")
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getMyFollows(@CurrentUser() user: UserResult) {
    return this.followsService.getMyFollows(user.id);
  }

  @Post(":politicianId")
  @UseGuards(JwtAuthGuard)
  follow(@CurrentUser() user: UserResult, @Param("politicianId") politicianId: string) {
    return this.followsService.follow(user.id, politicianId);
  }

  @Delete(":politicianId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  unfollow(@CurrentUser() user: UserResult, @Param("politicianId") politicianId: string) {
    return this.followsService.unfollow(user.id, politicianId);
  }

  @Get(":politicianId/status")
  @UseGuards(OptionalJwtAuthGuard)
  async checkFollow(
    @OptionalCurrentUser() user: UserResult | undefined,
    @Param("politicianId") politicianId: string,
  ) {
    if (!user) return { following: false };
    const following = await this.followsService.isFollowing(user.id, politicianId);
    return { following };
  }
}
