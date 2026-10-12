import { z } from "zod";
import { TIMELINE_CATEGORIES, TIMELINE_IMPORTANCE_LEVELS } from "@smart-politics/core";
import { sourceDtoSchema } from "@/lib/validations/source.schema";

/**
 * Schema Zod — valida em runtime a resposta de GET /profiles/:slug/timeline
 * antes de qualquer mapeamento. Categoria/importância vêm de
 * @smart-politics/core (fonte única do vocabulário, docs/SPECs/core/timeline.md)
 * — nunca redeclaradas aqui.
 */

export const timelineCategorySchema = z.enum(TIMELINE_CATEGORIES);

export const timelineImportanceSchema = z.enum(TIMELINE_IMPORTANCE_LEVELS);

export const timelineEventDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  occurredAt: z.string(),
  category: timelineCategorySchema,
  importance: timelineImportanceSchema,
  source: sourceDtoSchema,
  expandable: z.boolean(),
});

export const timelineEventListDtoSchema = z.array(timelineEventDtoSchema);

export type TimelineCategoryDto = z.infer<typeof timelineCategorySchema>;
export type TimelineImportanceDto = z.infer<typeof timelineImportanceSchema>;
export type TimelineEventDto = z.infer<typeof timelineEventDtoSchema>;
