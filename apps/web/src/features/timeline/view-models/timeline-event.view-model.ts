import type { TimelineCategory } from "../models";

/**
 * View Model — forma pronta para exibição. NUNCA conhece a API/DTO: só
 * importa tipos de models/ (Domain) e de si mesma. Componentes só
 * conhecem View Models, nunca Domain Models nem DTOs.
 */

export type TimelineImportanceVariant = "destructive" | "warning" | "default" | "outline";

export interface TimelineEventViewModel {
  id: string;
  title: string;
  summary: string;
  occurredAt: Date;
  dateLabel: string;
  year: number;
  category: TimelineCategory;
  categoryLabel: string;
  importanceLabel: string;
  importanceVariant: TimelineImportanceVariant;
  sourceLabel: string;
  expandable: boolean;
  /** Sugestão de estado inicial (Critical/High expandem, Medium/Low recolhem). */
  initiallyExpanded: boolean;
}
