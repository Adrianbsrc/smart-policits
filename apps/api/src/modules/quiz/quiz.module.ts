import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { CandidatesModule } from "../candidates/candidates.module";
import { QuizController } from "./quiz.controller";
import { QuizRepository } from "./quiz.repository";
import { QuizService } from "./quiz.service";

@Module({
  imports: [AuthModule, CandidatesModule],
  controllers: [QuizController],
  providers: [QuizService, QuizRepository],
})
export class QuizModule {}
