import type { ElectoralResult, PoliticalOfficeType } from "../validations";

/**
 * Domain Model — representação de domínio pura. NUNCA conhece a UI: sem
 * labels, sem strings formatadas (isso é apresentação — ver view-models/).
 */
export interface MandateModel {
  id: string;
  officeType: PoliticalOfficeType;
  officeName: string;
  startDate: Date;
  endDate: Date | null;
  reelected: boolean;
  electoralResult: ElectoralResult | null;
  electionYear: number | null;
  description: string | null;
}
