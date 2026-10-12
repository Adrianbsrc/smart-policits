import { z } from "zod";
import { sourceDtoSchema } from "@/lib/validations/source.schema";

/**
 * Schema Zod — fonte da verdade do DTO de Integrity. Valida em runtime a
 * resposta de GET /profiles/:slug/integrity antes de qualquer mapeamento.
 */

export const integrityStatusSchema = z.enum([
  "investigation",
  "archived",
  "acquitted",
  "convicted",
  "ongoing",
  "unknown",
]);

export const integrityCategorySchema = z.enum([
  "corruption",
  "misconduct",
  "electoral_crime",
  "financial_crime",
  "administrative_process",
  "audit_court",
  "other",
]);

export const integrityEvidenceDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  occurredAt: z.string(),
  source: sourceDtoSchema,
});

export const integrityRecordDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  category: integrityCategorySchema,
  status: integrityStatusSchema,
  occurredAt: z.string(),
  source: sourceDtoSchema,
  evidences: z.array(integrityEvidenceDtoSchema),
});

export const integrityRecordListDtoSchema = z.array(integrityRecordDtoSchema);

export type IntegrityStatusDto = z.infer<typeof integrityStatusSchema>;
export type IntegrityCategoryDto = z.infer<typeof integrityCategorySchema>;
export type IntegrityEvidenceDto = z.infer<typeof integrityEvidenceDtoSchema>;
export type IntegrityRecordDto = z.infer<typeof integrityRecordDtoSchema>;
