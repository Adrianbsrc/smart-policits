"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { quizService } from "@/lib/api/services/quiz.service";
import type { QuizMatch } from "@/lib/api/types";

export const QUIZ_RESULT_KEY = ["quiz-result"] as const;
export const QUIZ_MATCHES_KEY = ["quiz-matches"] as const;

export function useLatestQuizResult() {
  return useQuery({
    queryKey: QUIZ_RESULT_KEY,
    queryFn: () => quizService.getLatest(),
    staleTime: 5 * 60_000,
  });
}

export function useFreshQuizMatches() {
  return useQuery({
    queryKey: QUIZ_MATCHES_KEY,
    queryFn: () => quizService.getFreshMatches(),
    staleTime: 5 * 60_000,
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: Record<string, string>) => quizService.submit(answers),
    onSuccess: (data) => {
      queryClient.setQueryData(QUIZ_RESULT_KEY, data);
    },
  });
}

export function useDeleteQuizResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => quizService.deleteLatest(),
    onSuccess: () => {
      queryClient.setQueryData(QUIZ_RESULT_KEY, null);
      queryClient.removeQueries({ queryKey: QUIZ_MATCHES_KEY });
    },
  });
}

export function useMyMatchPercent(candidateId: string): number | null {
  const { data } = useLatestQuizResult();
  if (!data?.matches) return null;
  const match = data.matches.find((m: QuizMatch) => m.politicianId === candidateId);
  return match?.matchPercent ?? null;
}
