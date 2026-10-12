import { z } from "zod";
import { sourceDtoSchema } from "@/lib/validations/source.schema";

/**
 * Schema Zod — fonte da verdade do DTO de Promises. Valida em runtime a
 * resposta de GET /profiles/:slug/promises antes de qualquer mapeamento.
 */

export const promiseCategorySchema = z.enum([
  "economy",
  "education",
  "health",
  "security",
  "infrastructure",
  "environment",
  "technology",
  "foreign_relations",
  "human_rights",
  "public_management",
  "administrative_reform",
  "tax_reform",
  "other",
]);

export const promiseStatusSchema = z.enum([
  "promised",
  "in_progress",
  "partial",
  "fulfilled",
  "not_fulfilled",
  "not_verifiable",
  "revoked",
]);

export const promiseEvidenceDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  occurredAt: z.string(),
  source: sourceDtoSchema,
});

export const promiseDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  category: promiseCategorySchema,
  status: promiseStatusSchema,
  promisedAt: z.string(),
  dueDate: z.string().nullable(),
  completionPercentage: z.number(),
  evidences: z.array(promiseEvidenceDtoSchema),
  source: sourceDtoSchema,
});

export const promiseListDtoSchema = z.array(promiseDtoSchema);

export type PromiseCategoryDto = z.infer<typeof promiseCategorySchema>;
export type PromiseStatusDto = z.infer<typeof promiseStatusSchema>;
export type PromiseEvidenceDto = z.infer<typeof promiseEvidenceDtoSchema>;
export type PromiseDto = z.infer<typeof promiseDtoSchema>;
