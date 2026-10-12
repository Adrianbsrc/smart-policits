import { z } from "zod";
import { politicalOfficeTypeSchema, politicalProfileStatusSchema } from "./political-profile.schema";

export const executiveSummaryPartyDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  acronym: z.string(),
  logo: z.string().nullable(),
});

export const executiveSummaryOfficeDtoSchema = z.object({
  id: z.string(),
  type: politicalOfficeTypeSchema,
  name: z.string(),
});

export const executiveSummaryExperienceItemDtoSchema = z.object({
  officeType: politicalOfficeTypeSchema,
  officeName: z.string(),
  year: z.number(),
});

/** Sempre nulo hoje — ver ExecutiveSummaryDeclaredAssetsDto no backend para o porquê. */
export const executiveSummaryDeclaredAssetsDtoSchema = z.object({
  totalValueBrl: z.number(),
  year: z.number(),
});

export const executiveSummaryDtoSchema = z.object({
  slug: z.string(),
  fullName: z.string(),
  displayName: z.string(),
  photo: z.string().nullable(),
  status: politicalProfileStatusSchema,
  isIncumbent: z.boolean(),
  currentParty: executiveSummaryPartyDtoSchema.nullable(),
  currentOffice: executiveSummaryOfficeDtoSchema.nullable(),
  mandateCount: z.number(),
  shortBiography: z.string().nullable(),
  experience: z.array(executiveSummaryExperienceItemDtoSchema),
  yearsOfPublicLife: z.number().nullable(),
  firstElectionYear: z.number().nullable(),
  disputedElectionsCount: z.number(),
  declaredAssets: executiveSummaryDeclaredAssetsDtoSchema.nullable(),
  lastUpdatedAt: z.string(),
});

export type ExecutiveSummaryPartyDto = z.infer<typeof executiveSummaryPartyDtoSchema>;
export type ExecutiveSummaryOfficeDto = z.infer<typeof executiveSummaryOfficeDtoSchema>;
export type ExecutiveSummaryExperienceItemDto = z.infer<typeof executiveSummaryExperienceItemDtoSchema>;
export type ExecutiveSummaryDeclaredAssetsDto = z.infer<typeof executiveSummaryDeclaredAssetsDtoSchema>;
export type ExecutiveSummaryDto = z.infer<typeof executiveSummaryDtoSchema>;
