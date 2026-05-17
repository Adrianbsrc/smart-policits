import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { PoliticiansModule } from "../politicians/politicians.module";
import { QuizController } from "./quiz.controller";
import { QuizRepository } from "./quiz.repository";
import { QuizService } from "./quiz.service";

@Module({
  imports: [AuthModule, PoliticiansModule],
  controllers: [QuizController],
  providers: [QuizService, QuizRepository],
})
export class QuizModule {}
