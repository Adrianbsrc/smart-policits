import { z } from "zod";
import { sourceDtoSchema } from "@/lib/validations/source.schema";

/**
 * Schema Zod — fonte da verdade do DTO de Indicators. Valida em runtime a
 * resposta de GET /profiles/:slug/indicators antes de qualquer mapeamento.
 */

export const indicatorCategorySchema = z.enum([
  "economy",
  "education",
  "health",
  "security",
  "infrastructure",
  "environment",
]);

export const indicatorValueDtoSchema = z.object({
  period: z.string(),
  value: z.number(),
  variation: z.number().nullable(),
  notes: z.string().nullable(),
});

export const indicatorDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: indicatorCategorySchema,
  description: z.string(),
  unit: z.string(),
  values: z.array(indicatorValueDtoSchema),
  source: sourceDtoSchema,
});

export const indicatorListDtoSchema = z.array(indicatorDtoSchema);

export type IndicatorCategoryDto = z.infer<typeof indicatorCategorySchema>;
export type IndicatorValueDto = z.infer<typeof indicatorValueDtoSchema>;
export type IndicatorDto = z.infer<typeof indicatorDtoSchema>;
