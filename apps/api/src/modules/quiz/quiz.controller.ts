import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/auth.guard";
import { OptionalJwtAuthGuard, type MaybeAuthenticatedRequest } from "../auth/optional-jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { UserResult } from "../users/users.repository";
import { SubmitQuizDto } from "./dto/submit-quiz.dto";
import { QuizService } from "./quiz.service";

@ApiTags("quiz")
@Controller("quiz-results")
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  submit(@Req() req: MaybeAuthenticatedRequest, @Body() dto: SubmitQuizDto) {
    return this.quizService.submitQuiz(req.user?.id ?? null, dto.answers);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("latest")
  getLatest(@CurrentUser() user: UserResult) {
    return this.quizService.getLatestResult(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("matches")
  getFreshMatches(@CurrentUser() user: UserResult) {
    return this.quizService.getFreshMatches(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("latest")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLatest(@CurrentUser() user: UserResult) {
    return this.quizService.deleteLatestResult(user.id);
  }
}
