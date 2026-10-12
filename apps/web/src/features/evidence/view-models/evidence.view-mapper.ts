import type {
  EvidenceAttachmentType,
  EvidenceCategory,
  EvidenceContextModel,
  EvidenceContextScope,
  EvidenceContextType,
  EvidenceImpact,
  EvidenceModel,
  EvidenceReliability,
  EvidenceSourceModel,
  EvidenceSourceType,
} from "../models";
import type {
  EvidenceAttachmentViewModel,
  EvidenceContextViewModel,
  EvidenceImpactVariant,
  EvidenceReliabilityVariant,
  EvidenceSourceViewModel,
  EvidenceViewModel,
} from "./evidence.view-model";

/**
 * ViewModel Mapper — segunda etapa do fluxo obrigatório (Domain Model →
 * View Model). Único lugar onde category/impact/reliability/tipo viram
 * texto/cor de exibição. Importa apenas de models/ (Domain) e do próprio
 * view-models/ — nunca de validations/ ou api/.
 */

export const EVIDENCE_CATEGORY_LABELS: Record<EvidenceCategory, string> = {
  biography: "Biografia",
  professional_career: "Carreira profissional",
  political_career: "Carreira política",
  government_program: "Programa de governo",
  promise: "Promessa",
  public_expense: "Gasto público",
  asset: "Patrimônio",
  indicator: "Indicador",
  government_decision: "Decisão de governo",
  appointment: "Nomeação",
  law: "Lei",
  decree: "Decreto",
  interview: "Entrevista",
  public_statement: "Declaração pública",
  investigation: "Investigação",
  judicial_decision: "Decisão judicial",
  audit: "Auditoria",
  transparency: "Transparência",
  historical_event: "Marco histórico",
  external_event: "Evento externo",
};

const IMPACT_LABELS: Record<EvidenceImpact, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};

const IMPACT_VARIANTS: Record<EvidenceImpact, EvidenceImpactVariant> = {
  critical: "destructive",
  high: "warning",
  medium: "default",
  low: "outline",
};

const RELIABILITY_LABELS: Record<EvidenceReliability, string> = {
  official: "Oficial",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const RELIABILITY_VARIANTS: Record<EvidenceReliability, EvidenceReliabilityVariant> = {
  official: "success",
  high: "default",
  medium: "warning",
  low: "outline",
};

const SOURCE_TYPE_LABELS: Record<EvidenceSourceType, string> = {
  official_document: "Documento oficial",
  public_registry: "Registro público",
  judicial_record: "Registro judicial",
  audit_report: "Relatório de auditoria",
  news: "Notícia",
  interview: "Entrevista",
  social_media: "Rede social",
  other: "Outra",
};

const CONTEXT_TYPE_LABELS: Record<EvidenceContextType, string> = {
  pandemic: "Pandemia",
  war: "Guerra",
  international_crisis: "Crise internacional",
  economic_crisis: "Crise econômica",
  natural_disaster: "Desastre natural",
  constitutional_change: "Mudança constitucional",
  other: "Outro",
};

const CONTEXT_SCOPE_LABELS: Record<EvidenceContextScope, string> = {
  global: "Global",
  national: "Nacional",
  regional: "Regional",
  local: "Local",
};

const ATTACHMENT_TYPE_LABELS: Record<EvidenceAttachmentType, string> = {
  pdf: "PDF",
  video: "Vídeo",
  audio: "Áudio",
  document: "Documento",
  image: "Imagem",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatPeriod(start: Date, end: Date | null): string {
  if (!end) return `desde ${formatDate(start)}`;
  return `${formatDate(start)} — ${formatDate(end)}`;
}

function initiallyExpandedFor(impact: EvidenceImpact): boolean {
  return impact === "critical" || impact === "high";
}

function mapEvidenceSourceModelToViewModel(model: EvidenceSourceModel): EvidenceSourceViewModel {
  return {
    name: model.name,
    url: model.url,
    organizationLabel: model.organization,
    typeLabel: SOURCE_TYPE_LABELS[model.type],
    reliabilityLabel: RELIABILITY_LABELS[model.reliability],
    collectedAtLabel: formatDate(model.collectedAt),
  };
}

function mapEvidenceContextModelToViewModel(model: EvidenceContextModel): EvidenceContextViewModel {
  return {
    id: model.id,
    title: model.title,
    typeLabel: CONTEXT_TYPE_LABELS[model.type],
    scopeLabel: CONTEXT_SCOPE_LABELS[model.scope],
    periodLabel: formatPeriod(model.startDate, model.endDate),
  };
}

function mapEvidenceAttachmentModelToViewModel(
  model: EvidenceModel["attachments"][number],
): EvidenceAttachmentViewModel {
  return {
    id: model.id,
    typeLabel: ATTACHMENT_TYPE_LABELS[model.type],
    url: model.url,
    titleLabel: model.title ?? ATTACHMENT_TYPE_LABELS[model.type],
  };
}

export function mapEvidenceModelToViewModel(model: EvidenceModel): EvidenceViewModel {
  const sources = model.sources.map(mapEvidenceSourceModelToViewModel);

  return {
    id: model.id,
    politicalProfileId: model.politicalProfileId,
    title: model.title,
    summary: model.summary,
    description: model.description,
    occurredAt: model.occurredAt,
    dateLabel: formatDate(model.occurredAt),
    categories: model.categories,
    categoryLabels: model.categories.map((category) => EVIDENCE_CATEGORY_LABELS[category]),
    impactLabel: IMPACT_LABELS[model.impact],
    impactVariant: IMPACT_VARIANTS[model.impact],
    reliabilityLabel: RELIABILITY_LABELS[model.reliability],
    reliabilityVariant: RELIABILITY_VARIANTS[model.reliability],
    sources,
    primarySourceLabel: sources[0]?.name ?? "Sem fonte registrada",
    contexts: model.contexts.map(mapEvidenceContextModelToViewModel),
    attachments: model.attachments.map(mapEvidenceAttachmentModelToViewModel),
    tags: model.tags,
    expandable: true,
    initiallyExpanded: initiallyExpandedFor(model.impact),
  };
}
