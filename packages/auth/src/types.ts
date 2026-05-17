export interface AuthUser {
  id: string;
  email: string;
  role: "user" | "admin" | "moderator";
}

export interface Session {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
