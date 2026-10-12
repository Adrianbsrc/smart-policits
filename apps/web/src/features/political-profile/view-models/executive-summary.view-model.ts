/**
 * View Model — forma pronta para exibição. NUNCA conhece a API/DTO: só
 * importa tipos de models/ (Domain) e de si mesma. Componentes só
 * conhecem View Models, nunca Domain Models nem DTOs.
 */
export interface ExecutiveSummaryViewModel {
  slug: string;
  fullName: string;
  displayName: string;
  photoUrl: string | null;
  statusLabel: string;
  isIncumbent: boolean;
  currentPartyLabel: string | null;
  currentPartyAcronym: string | null;
  currentOfficeLabel: string | null;
  mandateCount: number;
  shortBiography: string | null;
  /** Ex: "Governador (2023) → Presidente (2023) · 3 anos de vida pública". */
  experienceLine: string | null;
  /** Ex: "Governador (2023)" — primeiro item de experience (ou "Não disponível"). */
  firstMandateLabel: string;
  disputedElectionsCount: number;
  /** Ex: "R$ 1.200.000,00 (declarado em 2022)" ou "Não disponível" — ver DeclaredAssets no domínio. */
  declaredAssetsLabel: string;
  /** Ex: "2 de agosto de 2026". */
  lastUpdatedLabel: string;
}
