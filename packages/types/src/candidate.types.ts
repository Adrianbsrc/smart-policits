export type Office = "president" | "governor" | "senator" | "federal_deputy" | "state_deputy";
export type ElectionYear = number;

export interface Party {
  id: string;
  name: string;
  acronym: string;
  colorHex: string;
  logoUrl: string | null;
  ideology: PartyIdeology;
}

export type PartyIdeology =
  | "far_left"
  | "left"
  | "center_left"
  | "center"
  | "center_right"
  | "right"
  | "far_right";

export interface Candidate {
  id: string;
  name: string;
  slug: string;
  office: Office;
  state: string | null;
  party: Party | null;
  photoUrl: string | null;
  bio: string | null;
  score: CandidateScore | null;
  tseId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateScore {
  id: string;
  candidateId: string;
  overall: number;
  education: number;
  health: number;
  security: number;
  economy: number;
  transparency: number;
  updatedAt: Date;
}

export interface CandidateListItem
  extends Pick<Candidate, "id" | "name" | "slug" | "office" | "state" | "photoUrl"> {
  party: Pick<Party, "acronym" | "colorHex"> | null;
  overallScore: number | null;
}

export interface CandidateFilters {
  office?: Office;
  state?: string;
  partyId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
