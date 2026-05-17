export const ENDPOINTS = {
  candidates: {
    list: "/candidates",
    detail: (slug: string) => `/candidates/${slug}`,
    votacoes: (slug: string) => `/candidates/${slug}/camara/votacoes`,
  },
  rankings: {
    list: "/rankings",
  },
  parties: {
    list: "/parties",
    detail: (acronym: string) => `/parties/${acronym}`,
  },
  users: {
    create: "/users",
    me: "/users/me",
    detail: (id: string) => `/users/${id}`,
  },
  follows: {
    list: "/follows",
    follow: (candidateId: string) => `/follows/${candidateId}`,
    unfollow: (candidateId: string) => `/follows/${candidateId}`,
    status: (candidateId: string) => `/follows/${candidateId}/status`,
  },
  quiz: {
    submit: "/quiz-results",
    latest: "/quiz-results/latest",
    deleteLatest: "/quiz-results/latest",
    matches: "/quiz-results/matches",
  },
  alerts: {
    list: "/alerts",
    unreadCount: "/alerts/unread-count",
    markRead: (id: string) => `/alerts/${id}/read`,
    markAllRead: "/alerts/read-all",
  },
} as const;
