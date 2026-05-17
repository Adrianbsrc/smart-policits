export type QuizDimension = "education" | "health" | "security" | "economy" | "transparency";

export interface QuizQuestion {
  id: string;
  text: string;
  dimension: QuizDimension;
  order: number;
}

export interface QuizUserAnswer {
  questionId: string;
  value: number;
}

export interface QuizMatchResult {
  candidateId: string;
  candidateName: string;
  candidateSlug: string;
  photoUrl: string | null;
  partyAcronym: string | null;
  matchPercentage: number;
  dimensionBreakdown: Record<QuizDimension, number>;
}

export interface QuizResultPayload {
  answers: QuizUserAnswer[];
  office?: string;
  state?: string;
}
