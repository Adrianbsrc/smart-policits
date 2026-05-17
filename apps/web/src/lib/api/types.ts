export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CandidateScore {
  overall: number;
  // Main dimensions — weight 2×
  education: number;
  health: number;
  security: number;
  economy: number;
  transparency: number;
  // Extended dimensions — weight 1×
  environment: number;
  infrastructure: number;
  technology: number;
  agriculture: number;
  international: number;
  culture: number;
  socialRights: number;
  entrepreneurship: number;
}

export interface CamaraVoto {
  id: string;
  tipoVoto: string;
  dataHoraRegistro: string;
  siglaOrgao: string;
  descricao: string;
  uri: string;
}

export interface PartyMini {
  id: string;
  name: string;
  acronym: string;
  colorHex: string;
  logoUrl: string | null;
}

export interface CandidateListItem {
  id: string;
  name: string;
  slug: string;
  office: string;
  state: string | null;
  photoUrl: string | null;
  party: PartyMini | null;
  score: CandidateScore | null;
}

export interface CandidateDetail extends CandidateListItem {
  bio: string | null;
  tseId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RankedCandidate {
  rank: number;
  id: string;
  name: string;
  slug: string;
  office: string;
  state: string | null;
  photoUrl: string | null;
  party: { name: string; acronym: string; colorHex: string } | null;
  score: CandidateScore | null;
}

export interface Party {
  id: string;
  name: string;
  acronym: string;
  colorHex: string;
  logoUrl: string | null;
  ideology: string;
  _count: { candidates: number };
}

export interface CandidateListFilters {
  office?: string;
  state?: string;
  party?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RankingFilters {
  office?: string;
  state?: string;
  party?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// --- Auth / User ---

export interface CurrentUser {
  id: string;
  supabaseId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// --- Follows ---

export interface FollowedCandidate {
  id: string;
  candidateId: string;
  createdAt: string;
  candidate: {
    id: string;
    name: string;
    slug: string;
    office: string;
    state: string | null;
    photoUrl: string | null;
    party: { name: string; acronym: string; colorHex: string } | null;
    score: CandidateScore | null;
  };
}

export interface FollowStatus {
  following: boolean;
}

// --- Quiz ---

export interface DimensionWeights {
  education: number;
  health: number;
  security: number;
  economy: number;
  transparency: number;
  environment: number;
  infrastructure: number;
  technology: number;
  agriculture: number;
  international: number;
  culture: number;
  socialRights: number;
  entrepreneurship: number;
}

export interface QuizMatch {
  candidateId: string;
  name: string;
  slug: string;
  office: string;
  state: string | null;
  party: { name: string; acronym: string; colorHex: string } | null;
  score: number;
  matchPercent: number;
}

export interface QuizResult {
  id: string | null;
  completedAt: string;
  weights: DimensionWeights;
  matches: QuizMatch[];
}

// --- Alerts ---

export type AlertType = "score_change" | "news";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  candidate: {
    id: string;
    name: string;
    slug: string;
    photoUrl: string | null;
  } | null;
}
