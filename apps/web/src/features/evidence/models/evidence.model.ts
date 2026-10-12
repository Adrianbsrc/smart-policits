import type { Source } from "@smart-politics/core";
import type {
  EvidenceAttachmentTypeDto,
  EvidenceCategoryDto,
  EvidenceContextScopeDto,
  EvidenceContextTypeDto,
  EvidenceImpactDto,
  EvidenceReliabilityDto,
  EvidenceSourceTypeDto,
} from "../validations";

/**
 * Domain Model — representação de domínio pura de Evidence. NUNCA conhece a
 * UI: sem labels, sem cores, sem strings formatadas para exibição (isso é
 * responsabilidade do View Model, ver view-models/).
 *
 * O vocabulário de categoria/impacto/confiabilidade é compartilhado com o
 * DTO (o valor em si não muda) — reaproveitar o tipo aqui evita duplicar a
 * lista de literais.
 */
export type EvidenceCategory = EvidenceCategoryDto;
export type EvidenceImpact = EvidenceImpactDto;
export type EvidenceReliability = EvidenceReliabilityDto;
export type EvidenceSourceType = EvidenceSourceTypeDto;
export type EvidenceContextType = EvidenceContextTypeDto;
export type EvidenceContextScope = EvidenceContextScopeDto;
export type EvidenceAttachmentType = EvidenceAttachmentTypeDto;

/** Estende o VO compartilhado `Source` — nunca duplicar o Shared Kernel. */
export interface EvidenceSourceModel extends Source {
  organization: string;
  type: EvidenceSourceType;
  reliability: EvidenceReliability;
  collectedAt: Date;
  checksum: string | null;
}

export interface EvidenceContextModel {
  id: string;
  title: string;
  description: string;
  type: EvidenceContextType;
  scope: EvidenceContextScope;
  startDate: Date;
  endDate: Date | null;
}

export interface EvidenceAttachmentModel {
  id: string;
  type: EvidenceAttachmentType;
  url: string;
  title: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
}

export interface EvidenceModel {
  id: string;
  politicalProfileId: string;
  mandateId: string | null;
  title: string;
  summary: string;
  description: string;
  occurredAt: Date;
  publishedAt: Date | null;
  categories: EvidenceCategory[];
  impact: EvidenceImpact;
  reliability: EvidenceReliability;
  sources: EvidenceSourceModel[];
  contexts: EvidenceContextModel[];
  attachments: EvidenceAttachmentModel[];
  tags: string[];
  metadata: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}
