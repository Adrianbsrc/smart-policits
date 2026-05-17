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

  @Post(":candidateId")
  @UseGuards(JwtAuthGuard)
  follow(@CurrentUser() user: UserResult, @Param("candidateId") candidateId: string) {
    return this.followsService.follow(user.id, candidateId);
  }

  @Delete(":candidateId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  unfollow(@CurrentUser() user: UserResult, @Param("candidateId") candidateId: string) {
    return this.followsService.unfollow(user.id, candidateId);
  }

  @Get(":candidateId/status")
  @UseGuards(OptionalJwtAuthGuard)
  async checkFollow(
    @OptionalCurrentUser() user: UserResult | undefined,
    @Param("candidateId") candidateId: string,
  ) {
    if (!user) return { following: false };
    const following = await this.followsService.isFollowing(user.id, candidateId);
    return { following };
  }
}
