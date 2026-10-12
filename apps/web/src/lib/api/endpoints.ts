export const ENDPOINTS = {
  politicians: {
    list: "/politicians",
    detail: (slug: string) => `/politicians/${slug}`,
    votacoes: (slug: string) => `/politicians/${slug}/camara/votacoes`,
    timeline: (slug: string) => `/politicians/${slug}/timeline`,
    scoreHistory: (slug: string) => `/politicians/${slug}/score-history`,
    scoreEvidence: (slug: string) => `/politicians/${slug}/score-evidence`,
    expenses: (slug: string) => `/politicians/${slug}/expenses`,
    expensesSummary: (slug: string) => `/politicians/${slug}/expenses/summary`,
  },
  rankings: {
    list: "/rankings",
  },
  parties: {
    list: "/parties",
    detail: (acronym: string) => `/parties/${acronym}`,
  },
  politicalProfiles: {
    list: "/profiles",
    detail: (slug: string) => `/profiles/${slug}`,
    mandates: (slug: string) => `/profiles/${slug}/mandates`,
    affiliations: (slug: string) => `/profiles/${slug}/affiliations`,
    executiveSummary: (slug: string) => `/profiles/${slug}/executive-summary`,
    timeline: (slug: string) => `/profiles/${slug}/timeline`,
    promises: (slug: string) => `/profiles/${slug}/promises`,
    indicators: (slug: string) => `/profiles/${slug}/indicators`,
    integrity: (slug: string) => `/profiles/${slug}/integrity`,
    evidences: (slug: string) => `/profiles/${slug}/evidences`,
  },
  evidences: {
    detail: (id: string) => `/evidences/${id}`,
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
