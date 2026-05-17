export const ENDPOINTS = {
  politicians: {
    list: "/politicians",
    detail: (slug: string) => `/politicians/${slug}`,
    votacoes: (slug: string) => `/politicians/${slug}/camara/votacoes`,
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
    follow: (politicianId: string) => `/follows/${politicianId}`,
    unfollow: (politicianId: string) => `/follows/${politicianId}`,
    status: (politicianId: string) => `/follows/${politicianId}/status`,
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
  feed: {
    list: "/feed",
    items: "/feed/items",
    item: (id: string) => `/feed/items/${id}`,
  },
} as const;
