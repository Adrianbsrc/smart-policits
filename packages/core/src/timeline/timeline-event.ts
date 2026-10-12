import type { Source } from "../domain/Source";

/**
 * Vocabulário de categoria/importância da Timeline (docs/SPECs/core/timeline.md).
 * Fonte única — nunca redeclarar em apps/api ou apps/web.
 */
export const TIMELINE_CATEGORIES = [
  "government",
  "economy",
  "education",
  "health",
  "security",
  "integrity",
  "assets",
  "promises",
  "biography",
] as const;

export type TimelineCategory = (typeof TIMELINE_CATEGORIES)[number];

export const TIMELINE_IMPORTANCE_LEVELS = ["critical", "high", "medium", "low"] as const;

export type TimelineImportance = (typeof TIMELINE_IMPORTANCE_LEVELS)[number];

/**
 * Domain shape de um evento de Timeline — sem labels, sem cor, sem string
 * formatada (isso é responsabilidade de cada consumidor, nunca do Shared
 * Kernel). Produzido exclusivamente por `mapEvidenceToTimelineEvent`.
 */
export interface TimelineEvent {
  id: string;
  title: string;
  summary: string;
  occurredAt: Date;
  category: TimelineCategory;
  importance: TimelineImportance;
  source: Source;
  expandable: boolean;
}
