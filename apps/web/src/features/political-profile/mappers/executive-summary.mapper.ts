import type { ExecutiveSummaryDto } from "../validations";
import type { ExecutiveSummaryModel } from "../models";

/** Mapper DTO → Domain Model. Nunca produz labels/strings de exibição — isso é trabalho do ViewModel Mapper em view-models/. */
export function mapExecutiveSummaryDtoToModel(dto: ExecutiveSummaryDto): ExecutiveSummaryModel {
  return {
    slug: dto.slug,
    fullName: dto.fullName,
    displayName: dto.displayName,
    photoUrl: dto.photo,
    status: dto.status,
    isIncumbent: dto.isIncumbent,
    currentPartyName: dto.currentParty?.name ?? null,
    currentPartyAcronym: dto.currentParty?.acronym ?? null,
    currentOfficeType: dto.currentOffice?.type ?? null,
    mandateCount: dto.mandateCount,
    shortBiography: dto.shortBiography,
    experience: dto.experience,
    yearsOfPublicLife: dto.yearsOfPublicLife,
    firstElectionYear: dto.firstElectionYear,
    disputedElectionsCount: dto.disputedElectionsCount,
    declaredAssets: dto.declaredAssets,
    lastUpdatedAt: new Date(dto.lastUpdatedAt),
  };
}
