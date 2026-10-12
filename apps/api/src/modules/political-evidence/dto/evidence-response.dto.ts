import { ApiProperty } from "@nestjs/swagger";

import { SourceDto } from "../../../common/dto/source.dto";
import {
  EVIDENCE_ATTACHMENT_TYPES,
  EVIDENCE_CATEGORIES,
  EVIDENCE_CONTEXT_SCOPES,
  EVIDENCE_CONTEXT_TYPES,
  EVIDENCE_IMPACT_LEVELS,
  EVIDENCE_RELIABILITY_LEVELS,
  EVIDENCE_SOURCE_TYPES,
  type EvidenceAttachmentType,
  type EvidenceCategory,
  type EvidenceContextScope,
  type EvidenceContextType,
  type EvidenceImpact,
  type EvidenceReliability,
  type EvidenceSourceType,
} from "../domain";

/**
 * DTOs de resposta de Evidence. Nunca reutilizar Evidence (domínio) ou
 * qualquer tipo Prisma diretamente — o mapeamento fica em
 * political-evidence.mapper.ts.
 */

export class EvidenceSourceDto extends SourceDto {
  @ApiProperty()
  organization: string;

  @ApiProperty({ enum: EVIDENCE_SOURCE_TYPES })
  type: EvidenceSourceType;

  @ApiProperty({ enum: EVIDENCE_RELIABILITY_LEVELS })
  reliability: EvidenceReliability;

  @ApiProperty()
  collectedAt: Date;

  @ApiProperty({ nullable: true, type: String })
  checksum: string | null;
}

export class EvidenceContextDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: EVIDENCE_CONTEXT_TYPES })
  type: EvidenceContextType;

  @ApiProperty({ enum: EVIDENCE_CONTEXT_SCOPES })
  scope: EvidenceContextScope;

  @ApiProperty()
  startDate: Date;

  @ApiProperty({ nullable: true, type: Date })
  endDate: Date | null;
}

export class EvidenceAttachmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: EVIDENCE_ATTACHMENT_TYPES })
  type: EvidenceAttachmentType;

  @ApiProperty()
  url: string;

  @ApiProperty({ nullable: true, type: String })
  title: string | null;

  @ApiProperty({ nullable: true, type: String })
  mimeType: string | null;

  @ApiProperty({ nullable: true, type: Number })
  sizeBytes: number | null;
}

export class EvidenceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  politicalProfileId: string;

  @ApiProperty({ nullable: true, type: String })
  mandateId: string | null;

  @ApiProperty()
  title: string;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  occurredAt: Date;

  @ApiProperty({ nullable: true, type: Date })
  publishedAt: Date | null;

  @ApiProperty({ enum: EVIDENCE_CATEGORIES, isArray: true })
  categories: EvidenceCategory[];

  @ApiProperty({ enum: EVIDENCE_IMPACT_LEVELS })
  impact: EvidenceImpact;

  @ApiProperty({ enum: EVIDENCE_RELIABILITY_LEVELS })
  reliability: EvidenceReliability;

  @ApiProperty({ type: [EvidenceSourceDto] })
  sources: EvidenceSourceDto[];

  @ApiProperty({ type: [EvidenceContextDto] })
  contexts: EvidenceContextDto[];

  @ApiProperty({ type: [EvidenceAttachmentDto] })
  attachments: EvidenceAttachmentDto[];

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ type: Object })
  metadata: Record<string, string>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
