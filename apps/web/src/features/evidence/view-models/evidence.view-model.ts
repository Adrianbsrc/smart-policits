import type { EvidenceCategory } from "../models";

/**
 * View Model — forma pronta para exibição. NUNCA conhece a API/DTO: só
 * importa tipos de models/ (Domain) e de si mesma. Componentes só conhecem
 * View Models, nunca Domain Models nem DTOs.
 */

export type EvidenceImpactVariant = "destructive" | "warning" | "default" | "outline";
export type EvidenceReliabilityVariant = "success" | "default" | "warning" | "outline";

export interface EvidenceSourceViewModel {
  name: string;
  url: string | null;
  organizationLabel: string;
  typeLabel: string;
  reliabilityLabel: string;
  collectedAtLabel: string;
}

export interface EvidenceContextViewModel {
  id: string;
  title: string;
  typeLabel: string;
  scopeLabel: string;
  periodLabel: string;
}

export interface EvidenceAttachmentViewModel {
  id: string;
  typeLabel: string;
  url: string;
  titleLabel: string;
}

export interface EvidenceViewModel {
  id: string;
  politicalProfileId: string;
  title: string;
  summary: string;
  description: string;
  occurredAt: Date;
  dateLabel: string;
  /** Valor bruto de domínio, mantido para filtros/adapters (ex.: Timeline) — mesmo padrão de TimelineEventViewModel.category. */
  categories: EvidenceCategory[];
  categoryLabels: string[];
  impactLabel: string;
  impactVariant: EvidenceImpactVariant;
  reliabilityLabel: string;
  reliabilityVariant: EvidenceReliabilityVariant;
  sources: EvidenceSourceViewModel[];
  /** Nome da primeira fonte, para exibição compacta (cards/listas). */
  primarySourceLabel: string;
  contexts: EvidenceContextViewModel[];
  attachments: EvidenceAttachmentViewModel[];
  tags: string[];
  /** Sempre true hoje (summary sempre preenchido) — mantido para paridade com o padrão Timeline/Indicators. */
  expandable: boolean;
  /** Sugestão de estado inicial (Critical/High expandem, Medium/Low recolhem) — mesma regra da Timeline. */
  initiallyExpanded: boolean;
}
