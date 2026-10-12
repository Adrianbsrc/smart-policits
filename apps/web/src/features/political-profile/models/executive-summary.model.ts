import type { PoliticalOfficeType, PoliticalProfileStatus } from "../validations";

export interface ExecutiveSummaryExperienceItem {
  officeType: PoliticalOfficeType;
  officeName: string;
  year: number;
}

/** Sempre `null` hoje — ver ExecutiveSummaryDeclaredAssetsDto no backend para o porquê. */
export interface DeclaredAssets {
  totalValueBrl: number;
  year: number;
}

/**
 * Domain Model — representação de domínio pura. NUNCA conhece a UI: sem
 * labels, sem strings formatadas (isso é apresentação — ver view-models/).
 */
export interface ExecutiveSummaryModel {
  slug: string;
  fullName: string;
  displayName: string;
  photoUrl: string | null;
  status: PoliticalProfileStatus;
  isIncumbent: boolean;
  currentPartyName: string | null;
  currentPartyAcronym: string | null;
  currentOfficeType: PoliticalOfficeType | null;
  mandateCount: number;
  shortBiography: string | null;
  experience: ExecutiveSummaryExperienceItem[];
  yearsOfPublicLife: number | null;
  firstElectionYear: number | null;
  disputedElectionsCount: number;
  declaredAssets: DeclaredAssets | null;
  lastUpdatedAt: Date;
}
