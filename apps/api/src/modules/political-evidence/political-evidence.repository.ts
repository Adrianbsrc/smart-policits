import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";

import { PrismaService } from "../../config/prisma.service";
import type { EvidenceDraft } from "./builders/political-profile-evidence.builder";
import type { Evidence, EvidenceAttachment, EvidenceContext, EvidenceSource } from "./domain";

/**
 * Persistência real de Evidence (docs/SPECs/core/evidence.md). `sources` e
 * `contexts` guardam `Date` em campos JSON — Prisma não serializa `Date`
 * dentro de `Json` automaticamente, então este é o único lugar que converte
 * para/de ISO string. `attachments`/`metadata`/`tags` não têm campo `Date`,
 * não precisam da mesma conversão.
 */

type EvidenceRecord = Prisma.EvidenceGetPayload<Record<string, never>>;

function serializeSource(source: EvidenceSource): Prisma.InputJsonValue {
  return { ...source, collectedAt: source.collectedAt.toISOString() };
}

function deserializeSource(json: unknown): EvidenceSource {
  const raw = json as Omit<EvidenceSource, "collectedAt"> & { collectedAt: string };
  return { ...raw, collectedAt: new Date(raw.collectedAt) };
}

function serializeContext(context: EvidenceContext): Prisma.InputJsonValue {
  return {
    ...context,
    startDate: context.startDate.toISOString(),
    endDate: context.endDate ? context.endDate.toISOString() : null,
  };
}

function deserializeContext(json: unknown): EvidenceContext {
  const raw = json as Omit<EvidenceContext, "startDate" | "endDate"> & { startDate: string; endDate: string | null };
  return { ...raw, startDate: new Date(raw.startDate), endDate: raw.endDate ? new Date(raw.endDate) : null };
}

function toEvidence(record: EvidenceRecord): Evidence {
  return {
    id: record.id,
    politicalProfileId: record.politicalProfileId,
    mandateId: record.mandateId,
    title: record.title,
    summary: record.summary,
    description: record.description,
    occurredAt: record.occurredAt,
    publishedAt: record.publishedAt,
    categories: record.categories,
    impact: record.impact,
    reliability: record.reliability,
    sources: (record.sources as unknown[]).map(deserializeSource),
    contexts: (record.contexts as unknown[]).map(deserializeContext),
    attachments: record.attachments as unknown as EvidenceAttachment[],
    tags: record.tags,
    metadata: record.metadata as Record<string, string>,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toCreateInput(draft: EvidenceDraft): Prisma.EvidenceCreateInput {
  return {
    title: draft.title,
    summary: draft.summary,
    description: draft.description,
    occurredAt: draft.occurredAt,
    publishedAt: draft.publishedAt,
    categories: draft.categories,
    impact: draft.impact,
    reliability: draft.reliability,
    sources: draft.sources.map(serializeSource),
    contexts: draft.contexts.map(serializeContext),
    attachments: draft.attachments as unknown as Prisma.InputJsonValue,
    tags: draft.tags,
    metadata: draft.metadata,
    profile: { connect: { id: draft.politicalProfileId } },
    ...(draft.mandateId && { mandate: { connect: { id: draft.mandateId } } }),
  };
}

@Injectable()
export class PoliticalEvidenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProfileId(profileId: string): Promise<Evidence[]> {
    const records = await this.prisma.evidence.findMany({
      where: { politicalProfileId: profileId },
      orderBy: { occurredAt: "desc" },
    });
    return records.map(toEvidence);
  }

  async findById(id: string): Promise<Evidence | null> {
    const record = await this.prisma.evidence.findUnique({ where: { id } });
    return record ? toEvidence(record) : null;
  }

  /** Nunca sobrescreve/apaga Evidence existente (docs/SPECs/core/evidence.md#princípios) — só insere. */
  async createMany(drafts: EvidenceDraft[]): Promise<Evidence[]> {
    if (drafts.length === 0) return [];

    // $transaction com create individual (em vez de createMany) porque
    // precisamos dos ids/timestamps gerados de volta — createMany do Prisma
    // não devolve os registros criados.
    const created = await this.prisma.$transaction(
      drafts.map((draft) => this.prisma.evidence.create({ data: toCreateInput(draft) })),
    );
    return created.map(toEvidence);
  }
}
