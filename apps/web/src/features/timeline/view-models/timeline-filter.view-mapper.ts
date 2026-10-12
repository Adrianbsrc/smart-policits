import type { TimelineCategory } from "../models";
import { TIMELINE_CATEGORY_LABELS } from "./timeline-event.view-mapper";
import type { TimelineFilterOption } from "./timeline-filter.view-model";

/**
 * Categorias expostas como botão de filtro (docs/SPECs/timeline.md).
 * "biography" existe como categoria de evento (ex: nascimento) mas não tem
 * filtro dedicado — permanece visível apenas em "Todos".
 */
const FILTERABLE_CATEGORIES: TimelineCategory[] = [
  "government",
  "economy",
  "education",
  "health",
  "security",
  "integrity",
  "assets",
  "promises",
];

export function getTimelineFilterOptions(): TimelineFilterOption[] {
  return [
    { value: "all", label: "Todos" },
    ...FILTERABLE_CATEGORIES.map((value) => ({ value, label: TIMELINE_CATEGORY_LABELS[value] })),
  ];
}
