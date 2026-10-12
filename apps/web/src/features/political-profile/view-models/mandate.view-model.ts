export interface MandateViewModel {
  id: string;
  officeLabel: string;
  /** Ex: "2023 — atual". */
  period: string;
  reelected: boolean;
  electoralResultLabel: string | null;
  electionYear: number | null;
  description: string | null;
}
