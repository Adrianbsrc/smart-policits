export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "user" | "admin" | "moderator";

export interface UserProfile extends User {
  followCount: number;
  quizResults: QuizResult[];
}

export interface QuizResult {
  id: string;
  userId: string;
  answers: QuizAnswer[];
  completedAt: Date;
}

export interface QuizAnswer {
  questionId: string;
  value: number;
}
