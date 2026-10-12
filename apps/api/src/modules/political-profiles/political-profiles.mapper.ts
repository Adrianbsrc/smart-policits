import type { MandateWithOffice, PoliticalProfileResult } from "./political-profiles.repository";
import type {
  ExecutiveSummaryExperienceItemDto,
  ExecutiveSummaryOfficeDto,
  ExecutiveSummaryPartyDto,
  ExecutiveSummaryResponseDto,
} from "./dto/executive-summary-response.dto";

const BIOGRAPHY_SUMMARY_MAX_LENGTH = 220;

function summarizeBiography(biography: string | null): string | null {
  if (!biography) return null;
  const trimmed = biography.trim();
  if (trimmed.length <= BIOGRAPHY_SUMMARY_MAX_LENGTH) return trimmed;

  const truncated = trimmed.slice(0, BIOGRAPHY_SUMMARY_MAX_LENGTH);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : BIOGRAPHY_SUMMARY_MAX_LENGTH)}…`;
}

/** Cargos distintos exercidos, um item por cargo, no ano em que foi ocupado pela primeira vez. */
function buildExperience(sortedMandates: MandateWithOffice[]): ExecutiveSummaryExperienceItemDto[] {
  const seenOfficeTypes = new Set<string>();
  const experience: ExecutiveSummaryExperienceItemDto[] = [];

  for (const mandate of sortedMandates) {
    if (seenOfficeTypes.has(mandate.office.type)) continue;
    seenOfficeTypes.add(mandate.office.type);
    experience.push({
      officeType: mandate.office.type,
      officeName: mandate.office.name,
      year: mandate.startDate.getFullYear(),
    });
  }

  return experience;
}

/**
 * Distingue "eleições disputadas" de "mandatos conhecidos": um Mandate pode
 * representar uma eleição perdida (`electoralResult: "not_elected"`), então
 * cada ano distinto em `electionYear` é uma eleição disputada — já
 * `mandateCount` (ver toExecutiveSummaryDto) conta todo registro de Mandate,
 * vencido ou não.
 */
function computeDisputedElectionYears(mandates: MandateWithOffice[]): number[] {
  const years = mandates
    .map((mandate) => mandate.electionYear)
    .filter((year): year is number => year !== null);
  return [...new Set(years)];
}

/** Do início do primeiro mandato até o fim do último (ou hoje, se algum mandato estiver em curso). */
function computeYearsOfPublicLife(sortedMandates: MandateWithOffice[]): number | null {
  const first = sortedMandates[0];
  if (!first) return null;

  const hasOngoingMandate = sortedMandates.some((mandate) => !mandate.endDate);
  const latestEnd = hasOngoingMandate
    ? new Date()
    : sortedMandates.reduce<Date>(
        (latest, mandate) => (mandate.endDate && mandate.endDate > latest ? mandate.endDate : latest),
        first.endDate ?? first.startDate,
      );

  return Math.max(latestEnd.getFullYear() - first.startDate.getFullYear(), 0);
}

export function toExecutiveSummaryDto(
  profile: PoliticalProfileResult,
  mandates: MandateWithOffice[],
): ExecutiveSummaryResponseDto {
  const currentAffiliation = profile.affiliations[0] ?? null;
  const sortedMandates = [...mandates].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const currentParty: ExecutiveSummaryPartyDto | null = currentAffiliation
    ? {
        id: currentAffiliation.party.id,
        name: currentAffiliation.party.name,
        acronym: currentAffiliation.party.acronym,
        logo: currentAffiliation.party.logo,
      }
    : null;

  const currentOffice: ExecutiveSummaryOfficeDto | null = profile.currentOffice
    ? { id: profile.currentOffice.id, type: profile.currentOffice.type, name: profile.currentOffice.name }
    : null;

  const disputedElectionYears = computeDisputedElectionYears(mandates);

  return {
    slug: profile.slug,
    fullName: profile.fullName,
    displayName: profile.displayName,
    photo: profile.photo,
    status: profile.status,
    isIncumbent: profile.isIncumbent,
    currentParty,
    currentOffice,
    mandateCount: mandates.length,
    shortBiography: summarizeBiography(profile.biography),
    experience: buildExperience(sortedMandates),
    yearsOfPublicLife: computeYearsOfPublicLife(sortedMandates),
    firstElectionYear: disputedElectionYears.length > 0 ? Math.min(...disputedElectionYears) : null,
    disputedElectionsCount: disputedElectionYears.length,
    // Ver ExecutiveSummaryDeclaredAssetsDto: sem fonte real ligada a PoliticalProfile ainda.
    declaredAssets: null,
    lastUpdatedAt: profile.updatedAt,
  };
}
