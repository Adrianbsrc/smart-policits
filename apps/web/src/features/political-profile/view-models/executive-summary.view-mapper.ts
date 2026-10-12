import type { PoliticalOfficeType, PoliticalProfileStatus } from "../validations";
import type { ExecutiveSummaryModel } from "../models";
import type { ExecutiveSummaryViewModel } from "./executive-summary.view-model";

/**
 * ViewModel Mapper — Domain Model → View Model. Único lugar onde
 * office/status viram texto de exibição. Importa apenas de models/
 * (Domain) e do próprio view-models/ — nunca de validations/ ou api/.
 *
 * Os labels exportados aqui são reaproveitados por mandate.view-mapper.ts
 * (mesma feature, mesmo vocabulário de cargo).
 */

export const POLITICAL_OFFICE_TYPE_LABELS: Record<PoliticalOfficeType, string> = {
  president: "Presidente",
  governor: "Governador",
  mayor: "Prefeito",
  senator: "Senador",
  federal_deputy: "Deputado Federal",
  state_deputy: "Deputado Estadual",
};

const POLITICAL_PROFILE_STATUS_LABELS: Record<PoliticalProfileStatus, string> = {
  pre_candidate: "Pré-candidato",
  candidate: "Candidato",
  elected: "Eleito",
  in_mandate: "Em exercício",
  former: "Ex-mandatário",
  inactive: "Inativo",
};

const NOT_AVAILABLE_LABEL = "Não disponível";

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function buildExperienceLine(model: ExecutiveSummaryModel): string | null {
  if (model.experience.length === 0) return null;

  const offices = model.experience
    .map((item) => `${POLITICAL_OFFICE_TYPE_LABELS[item.officeType]} (${item.year})`)
    .join(" → ");

  if (!model.yearsOfPublicLife) return offices;

  const unit = model.yearsOfPublicLife === 1 ? "ano" : "anos";
  return `${offices} · ${model.yearsOfPublicLife} ${unit} de vida pública`;
}

function buildFirstMandateLabel(model: ExecutiveSummaryModel): string {
  const first = model.experience[0];
  if (!first) return NOT_AVAILABLE_LABEL;
  return `${POLITICAL_OFFICE_TYPE_LABELS[first.officeType]} (${first.year})`;
}

function formatDeclaredAssets(assets: ExecutiveSummaryModel["declaredAssets"]): string {
  if (!assets) return NOT_AVAILABLE_LABEL;
  return `${CURRENCY_FORMATTER.format(assets.totalValueBrl)} (declarado em ${assets.year})`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function mapExecutiveSummaryModelToViewModel(model: ExecutiveSummaryModel): ExecutiveSummaryViewModel {
  return {
    slug: model.slug,
    fullName: model.fullName,
    displayName: model.displayName,
    photoUrl: model.photoUrl,
    statusLabel: POLITICAL_PROFILE_STATUS_LABELS[model.status],
    isIncumbent: model.isIncumbent,
    currentPartyLabel: model.currentPartyName ? `${model.currentPartyName} (${model.currentPartyAcronym})` : null,
    currentPartyAcronym: model.currentPartyAcronym,
    currentOfficeLabel: model.currentOfficeType ? POLITICAL_OFFICE_TYPE_LABELS[model.currentOfficeType] : null,
    mandateCount: model.mandateCount,
    shortBiography: model.shortBiography,
    experienceLine: buildExperienceLine(model),
    firstMandateLabel: buildFirstMandateLabel(model),
    disputedElectionsCount: model.disputedElectionsCount,
    declaredAssetsLabel: formatDeclaredAssets(model.declaredAssets),
    lastUpdatedLabel: formatDate(model.lastUpdatedAt),
  };
}
