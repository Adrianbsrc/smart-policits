import type { TimelineCategory, TimelineEventModel, TimelineImportance } from "../models";
import type { TimelineEventViewModel, TimelineImportanceVariant } from "./timeline-event.view-model";

/**
 * ViewModel Mapper — Domain Model → View Model. Único lugar onde
 * category/importance viram texto/cor de exibição. Importa apenas de
 * models/ (Domain) e do próprio view-models/ — nunca de validations/ ou api/.
 */

export const TIMELINE_CATEGORY_LABELS: Record<TimelineCategory, string> = {
  government: "Governo",
  economy: "Economia",
  education: "Educação",
  health: "Saúde",
  security: "Segurança",
  integrity: "Integridade",
  assets: "Patrimônio",
  promises: "Promessas",
  biography: "Biografia",
};

const IMPORTANCE_LABELS: Record<TimelineImportance, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const IMPORTANCE_VARIANTS: Record<TimelineImportance, TimelineImportanceVariant> = {
  critical: "destructive",
  high: "warning",
  medium: "default",
  low: "outline",
};

function initiallyExpandedFor(importance: TimelineImportance): boolean {
  return importance === "critical" || importance === "high";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function mapTimelineEventModelToViewModel(model: TimelineEventModel): TimelineEventViewModel {
  return {
    id: model.id,
    title: model.title,
    summary: model.summary,
    occurredAt: model.occurredAt,
    dateLabel: formatDate(model.occurredAt),
    year: model.year,
    category: model.category,
    categoryLabel: TIMELINE_CATEGORY_LABELS[model.category],
    importanceLabel: IMPORTANCE_LABELS[model.importance],
    importanceVariant: IMPORTANCE_VARIANTS[model.importance],
    sourceLabel: model.source.name,
    expandable: model.expandable,
    initiallyExpanded: model.expandable && initiallyExpandedFor(model.importance),
  };
}
