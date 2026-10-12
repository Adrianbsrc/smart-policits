import type { PromiseCategory, PromiseEvidenceModel, PromiseModel, PromiseStatus } from "../models";
import type { PromiseEvidenceViewModel, PromiseStatusVariant, PromiseViewModel } from "./promise.view-model";

/**
 * ViewModel Mapper — Domain Model → View Model. Único lugar onde
 * category/status viram texto/cor de exibição. Importa apenas de models/
 * (Domain) e do próprio view-models/ — nunca de validations/ ou api/.
 */

export const PROMISE_CATEGORY_LABELS: Record<PromiseCategory, string> = {
  economy: "Economia",
  education: "Educação",
  health: "Saúde",
  security: "Segurança",
  infrastructure: "Infraestrutura",
  environment: "Meio Ambiente",
  technology: "Tecnologia",
  foreign_relations: "Relações Exteriores",
  human_rights: "Direitos Humanos",
  public_management: "Gestão Pública",
  administrative_reform: "Reforma Administrativa",
  tax_reform: "Reforma Tributária",
  other: "Outros",
};

export const PROMISE_STATUS_LABELS: Record<PromiseStatus, string> = {
  promised: "Prometida",
  in_progress: "Em andamento",
  partial: "Parcialmente cumprida",
  fulfilled: "Cumprida",
  not_fulfilled: "Não cumprida",
  not_verifiable: "Não verificável",
  revoked: "Revogada",
};

const STATUS_VARIANTS: Record<PromiseStatus, PromiseStatusVariant> = {
  fulfilled: "success",
  in_progress: "primary",
  partial: "warning",
  not_fulfilled: "destructive",
  not_verifiable: "outline",
  promised: "default",
  revoked: "outline",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function mapEvidenceToViewModel(evidence: PromiseEvidenceModel): PromiseEvidenceViewModel {
  return {
    id: evidence.id,
    title: evidence.title,
    description: evidence.description,
    dateLabel: formatDate(evidence.occurredAt),
  };
}

export function mapPromiseModelToViewModel(model: PromiseModel): PromiseViewModel {
  return {
    id: model.id,
    title: model.title,
    summary: model.summary,
    description: model.description,
    categoryLabel: PROMISE_CATEGORY_LABELS[model.category],
    statusLabel: PROMISE_STATUS_LABELS[model.status],
    statusVariant: STATUS_VARIANTS[model.status],
    dateLabel: formatDate(model.promisedAt),
    dueDateLabel: model.dueDate ? formatDate(model.dueDate) : null,
    completionPercentage: model.completionPercentage,
    evidences: model.evidences.map(mapEvidenceToViewModel),
    sourceLabel: model.source.name,
  };
}
