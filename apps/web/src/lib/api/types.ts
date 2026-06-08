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

export type ScoreType = "mock" | "partial" | "real";

export interface PoliticianScore {
  overall: number;
  scoreType: ScoreType;
  // Thematic dimensions
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
  // Structural pillars (score 2.0)
  activity: number;
  fiscal: number;
  constitutional: number;
  // Integrity
  integrityMultiplier: number;
  penalties: PenaltyRecord[];
  breakdown: ScoreBreakdown | null;
  scoreVersion: string;
}

export interface PenaltyRecord {
  reason: string;
  penalty: number;
  source: string;
}

export interface ScoreBreakdown {
  baseScore: number;
  transparency: number;
  activity: number;
  fiscal: number;
  constitutional: number;
  thematic: number;
  presenceRate?: number;
  billsProposed?: number;
  billsApproved?: number;
}

// Legacy alias for backward compat within this session
export type CandidateScore = PoliticianScore;

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

export interface PoliticianListItem {
  id: string;
  name: string;
  slug: string;
  office: string;
  state: string | null;
  photoUrl: string | null;
  fichaLimpaIneligible: boolean;
  candidateNumber: number | null;
  party: PartyMini | null;
  score: PoliticianScore | null;
}

// Legacy alias
export type CandidateListItem = PoliticianListItem;

export interface PoliticianDetail extends PoliticianListItem {
  bio: string | null;
  tseId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Legacy alias
export type CandidateDetail = PoliticianDetail;

export interface RankedPolitician {
  rank: number;
  id: string;
  name: string;
  slug: string;
  office: string;
  state: string | null;
  photoUrl: string | null;
  fichaLimpaIneligible: boolean;
  candidateNumber: number | null;
  mandateCount: number | null;
  party: { name: string; acronym: string; colorHex: string } | null;
  score: PoliticianScore | null;
}

// Legacy alias
export type RankedCandidate = RankedPolitician;

export interface Party {
  id: string;
  name: string;
  acronym: string;
  colorHex: string;
  logoUrl: string | null;
  ideology: string;
  _count: { politicians: number };
}

export interface PoliticianListFilters {
  office?: string;
  state?: string;
  party?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Legacy alias
export type CandidateListFilters = PoliticianListFilters;

export interface RankingFilters {
  /** Suporta um ou múltiplos cargos */
  office?: string | string[];
  state?: string | string[];
  party?: string | string[];
  search?: string;
  fichaLimpa?: boolean;
  /** Estreante: 1º mandato */
  estreante?: boolean;
  /** Reeleito: 2+ mandatos */
  reeleito?: boolean;
  /** Veterano: 3+ mandatos */
  veterano?: boolean;
  /** Pré-candidato 2026 */
  preCandidate?: boolean;
  sortBy?: "overall" | "transparency" | "activity" | "constitutional" | "integrityMultiplier";
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

export interface FollowedPolitician {
  id: string;
  politicianId: string;
  createdAt: string;
  politician: {
    id: string;
    name: string;
    slug: string;
    office: string;
    state: string | null;
    photoUrl: string | null;
    party: { name: string; acronym: string; colorHex: string } | null;
    score: PoliticianScore | null;
  };
}

// Legacy alias
export type FollowedCandidate = FollowedPolitician;

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
  politicianId: string;
  name: string;
  slug: string;
  office: string;
  state: string | null;
  party: { name: string; acronym: string; colorHex: string } | null;
  score: number;
  matchPercent: number;
}

// Legacy alias for old candidateId field
export type CandidateQuizMatch = QuizMatch & { candidateId?: string };

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
  politician: {
    id: string;
    name: string;
    slug: string;
    photoUrl: string | null;
  } | null;
}

// --- Timeline / PoliticalEvents ---

export type PoliticalEventType =
  | "vote"
  | "bill_proposed"
  | "bill_approved"
  | "investigation"
  | "decree"
  | "public_expense"
  | "statement";

export interface PoliticalEventEvidence {
  dimension: string;
  explanation: string;
  deltaValue: number;
}

export interface PoliticalEvent {
  id: string;
  type: PoliticalEventType;
  title: string;
  description: string;
  eventDate: string;
  sourceUrl: string | null;
  sourceLabel: string | null;
  topics: string[];
  sentiment: number;
  impact: number;
  metadata: Record<string, unknown>;
  evidences: PoliticalEventEvidence[];
}

// --- Score History ---

export interface ScoreHistoryPoint {
  id: string;
  overall: number;
  activity: number;
  transparency: number;
  fiscal: number;
  constitutional: number;
  integrityMultiplier: number;
  scoreType: string;
  trigger: string;
  snapshotAt: string;
}

// --- Score Evidence ---

export interface ScoreEvidence {
  id: string;
  dimension: string;
  explanation: string;
  deltaValue: number;
  createdAt: string;
  event: {
    id: string;
    title: string;
    eventDate: string;
    type: PoliticalEventType;
    sourceUrl: string | null;
  } | null;
}

// --- Expenses ---

export type ExpenseCategory = "travel" | "office" | "fuel" | "consultancy" | "publicity" | "other";

export interface PublicExpense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amountBrl: number;
  expenseDate: string;
  supplier: string | null;
  documentUrl: string | null;
  year: number;
  month: number;
  createdAt: string;
}

export interface ExpenseSummary {
  year: number;
  totalBrl: number;
  byCategory: { category: string; totalBrl: number; count: number }[];
}

// --- Feed ---

export type FeedItemType = "politician_spotlight" | "news" | "law_update" | "poll" | "generic";

export interface FeedItemMetadata {
  // politician_spotlight
  overall?: number;
  integrityMultiplier?: number;
  penalties?: PenaltyRecord[];
  topDimension?: string;
  worstDimension?: string;
  office?: string;
  partyAcronym?: string | null;
  partyColorHex?: string | null;
  matchPercent?: number;
  // news
  source?: string;
  url?: string;
  tags?: string[];
  // law_update
  billId?: string;
  billTitle?: string;
  votesFor?: number;
  votesAgainst?: number;
  totalVotes?: number;
  status?: string;
  // poll
  question?: string;
  options?: { label: string; votes: number }[];
  // generic
  color?: string;
  icon?: string;
}

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  metadata: FeedItemMetadata;
  publishedAt: string;
  politicianId: string | null;
  politician: { name: string; slug: string; photoUrl: string | null } | null;
}
