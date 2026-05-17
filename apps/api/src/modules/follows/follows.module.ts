import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { CandidatesModule } from "../candidates/candidates.module";
import { FollowsController } from "./follows.controller";
import { FollowsRepository } from "./follows.repository";
import { FollowsService } from "./follows.service";

@Module({
  imports: [AuthModule, CandidatesModule],
  controllers: [FollowsController],
  providers: [FollowsService, FollowsRepository],
})
export class FollowsModule {}
