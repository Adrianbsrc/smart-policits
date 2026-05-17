import { authedApi } from "../authed-client";
import { ENDPOINTS } from "../endpoints";
import type { QuizResult } from "../types";

export const quizService = {
  submit(answers: Record<string, string>): Promise<QuizResult> {
    return authedApi.post<QuizResult>(ENDPOINTS.quiz.submit, { answers });
  },

  getLatest(): Promise<QuizResult | null> {
    return authedApi.get<QuizResult | null>(ENDPOINTS.quiz.latest);
  },

  getFreshMatches(): Promise<QuizResult | null> {
    return authedApi.get<QuizResult | null>(ENDPOINTS.quiz.matches);
  },

  deleteLatest(): Promise<void> {
    return authedApi.delete<void>(ENDPOINTS.quiz.deleteLatest);
  },
};
