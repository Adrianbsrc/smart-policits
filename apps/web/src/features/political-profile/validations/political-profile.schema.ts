import { z } from "zod";

/**
 * Schema Zod — fonte da verdade dos DTOs da feature. Os tipos DTO (abaixo)
 * derivam `z.infer` destes schemas — nunca duplicar a forma dos dados entre
 * validação e tipagem.
 */

export const politicalProfileStatusSchema = z.enum([
  "pre_candidate",
  "candidate",
  "elected",
  "in_mandate",
  "former",
  "inactive",
]);

export const politicalOfficeTypeSchema = z.enum([
  "president",
  "governor",
  "mayor",
  "senator",
  "federal_deputy",
  "state_deputy",
]);

export const politicalOfficeScopeSchema = z.enum(["national", "state", "municipal"]);

export const electoralResultSchema = z.enum(["elected", "runner_up", "not_elected"]);

export const politicalOfficeDtoSchema = z.object({
  id: z.string(),
  type: politicalOfficeTypeSchema,
  name: z.string(),
  scope: politicalOfficeScopeSchema,
  termYears: z.number(),
});

export const politicalPartyDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  acronym: z.string(),
  number: z.number().nullable(),
  logo: z.string().nullable(),
});

export const politicalAffiliationDtoSchema = z.object({
  id: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  isCurrent: z.boolean(),
  reason: z.string().nullable(),
  party: politicalPartyDtoSchema,
});

/**
 * Forma abreviada de afiliação embutida em `PoliticalProfileDto` — o
 * repositório (`politicalProfileSelect` em political-profiles.repository.ts)
 * só seleciona `id`/`startDate`/`party` aqui (a query já filtra
 * `isCurrent: true`, então os demais campos são redundantes). Schema
 * separado de `politicalAffiliationDtoSchema`, que continua completo para
 * `GET /profiles/:slug/affiliations` (histórico).
 */
export const politicalProfileCurrentAffiliationDtoSchema = z.object({
  id: z.string(),
  startDate: z.string(),
  party: politicalPartyDtoSchema,
});

export const mandateViceProfileDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  fullName: z.string(),
  displayName: z.string(),
  photo: z.string().nullable(),
});

export const mandateDtoSchema = z.object({
  id: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  reelected: z.boolean(),
  description: z.string().nullable(),
  electionYear: z.number().nullable(),
  electionRound: z.number().nullable(),
  votes: z.number().nullable(),
  electoralResult: electoralResultSchema.nullable(),
  startReason: z.string().nullable(),
  endReason: z.string().nullable(),
  viceProfileId: z.string().nullable(),
  office: politicalOfficeDtoSchema,
  viceProfile: mandateViceProfileDtoSchema.nullable(),
});

export const politicalProfileDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  fullName: z.string(),
  displayName: z.string(),
  biography: z.string().nullable(),
  photo: z.string().nullable(),
  birthDate: z.string().nullable(),
  birthPlace: z.string().nullable(),
  status: politicalProfileStatusSchema,
  isCandidate: z.boolean(),
  isIncumbent: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  currentOffice: politicalOfficeDtoSchema.nullable(),
  affiliations: z.array(politicalProfileCurrentAffiliationDtoSchema),
});

/** Envelope de paginação usado pelos endpoints de listagem. */
export function paginatedDtoSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });
}

export type PoliticalProfileStatus = z.infer<typeof politicalProfileStatusSchema>;
export type PoliticalOfficeType = z.infer<typeof politicalOfficeTypeSchema>;
export type PoliticalOfficeScope = z.infer<typeof politicalOfficeScopeSchema>;
export type ElectoralResult = z.infer<typeof electoralResultSchema>;

export type PoliticalOfficeDto = z.infer<typeof politicalOfficeDtoSchema>;
export type PoliticalPartyDto = z.infer<typeof politicalPartyDtoSchema>;
export type PoliticalAffiliationDto = z.infer<typeof politicalAffiliationDtoSchema>;
export type PoliticalProfileCurrentAffiliationDto = z.infer<typeof politicalProfileCurrentAffiliationDtoSchema>;
export type MandateViceProfileDto = z.infer<typeof mandateViceProfileDtoSchema>;
export type MandateDto = z.infer<typeof mandateDtoSchema>;
export type PoliticalProfileDto = z.infer<typeof politicalProfileDtoSchema>;

export interface PoliticalProfileListFilters {
  status?: PoliticalProfileStatus;
  partyId?: string;
  officeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
