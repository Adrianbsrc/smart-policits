/**
 * View Model — forma pronta para exibição. NUNCA conhece a API/DTO: só
 * importa tipos de models/ (Domain) e de si mesma. Componentes só
 * conhecem View Models, nunca Domain Models nem DTOs.
 */

export type PromiseStatusVariant = "success" | "primary" | "warning" | "destructive" | "outline" | "default";

export interface PromiseEvidenceViewModel {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
}

export interface PromiseViewModel {
  id: string;
  title: string;
  summary: string;
  description: string;
  categoryLabel: string;
  statusLabel: string;
  statusVariant: PromiseStatusVariant;
  dateLabel: string;
  dueDateLabel: string | null;
  completionPercentage: number;
  evidences: PromiseEvidenceViewModel[];
  sourceLabel: string;
}
