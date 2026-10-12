import type { Source, TimelineCategory, TimelineImportance } from "@smart-politics/core";

export type { TimelineCategory, TimelineImportance };

/**
 * Domain Model — representação de domínio pura. NUNCA conhece a UI: sem
 * labels, sem cores, sem decisão de "expandido por padrão" (isso é
 * apresentação — ver view-models/).
 *
 * category/importance vêm de @smart-politics/core — fonte única do
 * vocabulário da Timeline (docs/SPECs/core/timeline.md), nunca redeclarada
 * aqui nem no backend.
 */
export interface TimelineEventModel {
  id: string;
  title: string;
  summary: string;
  occurredAt: Date;
  year: number;
  category: TimelineCategory;
  importance: TimelineImportance;
  source: Source;
  expandable: boolean;
}
