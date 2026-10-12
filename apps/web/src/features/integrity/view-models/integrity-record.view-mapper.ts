import type { IntegrityCategory, IntegrityEvidenceModel, IntegrityRecordModel, IntegrityStatus } from "../models";
import type { IntegrityEvidenceViewModel, IntegrityRecordViewModel } from "./integrity-record.view-model";

/**
 * ViewModel Mapper — Domain Model → View Model. Único lugar onde
 * category/status viram texto de exibição. Importa apenas de models/
 * (Domain) e do próprio view-models/ — nunca de validations/ ou api/.
 */

export const INTEGRITY_CATEGORY_LABELS: Record<IntegrityCategory, string> = {
  corruption: "Corrupção",
  misconduct: "Improbidade",
  electoral_crime: "Crime Eleitoral",
  financial_crime: "Crime Financeiro",
  administrative_process: "Processo Administrativo",
  audit_court: "Tribunal de Contas",
  other: "Outras",
};

export const INTEGRITY_STATUS_LABELS: Record<IntegrityStatus, string> = {
  investigation: "Investigação",
  archived: "Arquivado",
  acquitted: "Absolvido",
  convicted: "Condenado",
  ongoing: "Em andamento",
  unknown: "Não informado",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function mapEvidenceToViewModel(evidence: IntegrityEvidenceModel): IntegrityEvidenceViewModel {
  return {
    id: evidence.id,
    title: evidence.title,
    description: evidence.description,
    dateLabel: formatDate(evidence.occurredAt),
    sourceLabel: evidence.source.name,
  };
}

export function mapIntegrityRecordModelToViewModel(model: IntegrityRecordModel): IntegrityRecordViewModel {
  return {
    id: model.id,
    title: model.title,
    summary: model.summary,
    description: model.description,
    categoryLabel: INTEGRITY_CATEGORY_LABELS[model.category],
    statusLabel: INTEGRITY_STATUS_LABELS[model.status],
    dateLabel: formatDate(model.occurredAt),
    sourceLabel: model.source.name,
    evidences: model.evidences.map(mapEvidenceToViewModel),
  };
}
