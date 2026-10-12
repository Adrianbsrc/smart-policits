import { z } from "zod";
import { sourceDtoSchema } from "@/lib/validations/source.schema";

/**
 * Schema Zod — fonte da verdade do DTO de Evidence. Valida em runtime a
 * resposta de GET /profiles/:slug/evidences (e GET /evidences/:id) antes de
 * qualquer mapeamento. Espelha apps/api/src/modules/political-evidence/domain.
 */

export const evidenceCategorySchema = z.enum([
  "biography",
  "professional_career",
  "political_career",
  "government_program",
  "promise",
  "public_expense",
  "asset",
  "indicator",
  "government_decision",
  "appointment",
  "law",
  "decree",
  "interview",
  "public_statement",
  "investigation",
  "judicial_decision",
  "audit",
  "transparency",
  "historical_event",
  "external_event",
]);

export const evidenceImpactSchema = z.enum(["critical", "high", "medium", "low"]);

export const evidenceReliabilitySchema = z.enum(["official", "high", "medium", "low"]);

export const evidenceSourceTypeSchema = z.enum([
  "official_document",
  "public_registry",
  "judicial_record",
  "audit_report",
  "news",
  "interview",
  "social_media",
  "other",
]);

export const evidenceContextTypeSchema = z.enum([
  "pandemic",
  "war",
  "international_crisis",
  "economic_crisis",
  "natural_disaster",
  "constitutional_change",
  "other",
]);

export const evidenceContextScopeSchema = z.enum(["global", "national", "regional", "local"]);

export const evidenceAttachmentTypeSchema = z.enum(["pdf", "video", "audio", "document", "image"]);

export const evidenceSourceDtoSchema = sourceDtoSchema.extend({
  organization: z.string(),
  type: evidenceSourceTypeSchema,
  reliability: evidenceReliabilitySchema,
  collectedAt: z.string(),
  checksum: z.string().nullable(),
});

export const evidenceContextDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: evidenceContextTypeSchema,
  scope: evidenceContextScopeSchema,
  startDate: z.string(),
  endDate: z.string().nullable(),
});

export const evidenceAttachmentDtoSchema = z.object({
  id: z.string(),
  type: evidenceAttachmentTypeSchema,
  url: z.string(),
  title: z.string().nullable(),
  mimeType: z.string().nullable(),
  sizeBytes: z.number().nullable(),
});

export const evidenceDtoSchema = z.object({
  id: z.string(),
  politicalProfileId: z.string(),
  mandateId: z.string().nullable(),
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  occurredAt: z.string(),
  publishedAt: z.string().nullable(),
  categories: z.array(evidenceCategorySchema),
  impact: evidenceImpactSchema,
  reliability: evidenceReliabilitySchema,
  sources: z.array(evidenceSourceDtoSchema),
  contexts: z.array(evidenceContextDtoSchema),
  attachments: z.array(evidenceAttachmentDtoSchema),
  tags: z.array(z.string()),
  metadata: z.record(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const evidenceListDtoSchema = z.array(evidenceDtoSchema);

export type EvidenceCategoryDto = z.infer<typeof evidenceCategorySchema>;
export type EvidenceImpactDto = z.infer<typeof evidenceImpactSchema>;
export type EvidenceReliabilityDto = z.infer<typeof evidenceReliabilitySchema>;
export type EvidenceSourceTypeDto = z.infer<typeof evidenceSourceTypeSchema>;
export type EvidenceContextTypeDto = z.infer<typeof evidenceContextTypeSchema>;
export type EvidenceContextScopeDto = z.infer<typeof evidenceContextScopeSchema>;
export type EvidenceAttachmentTypeDto = z.infer<typeof evidenceAttachmentTypeSchema>;
export type EvidenceSourceDto = z.infer<typeof evidenceSourceDtoSchema>;
export type EvidenceContextDto = z.infer<typeof evidenceContextDtoSchema>;
export type EvidenceAttachmentDto = z.infer<typeof evidenceAttachmentDtoSchema>;
export type EvidenceDto = z.infer<typeof evidenceDtoSchema>;
