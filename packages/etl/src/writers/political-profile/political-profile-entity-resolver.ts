import { slugify } from "@smart-politics/core";
import type { PrismaClient } from "@smart-politics/db";

import type { PoliticalProfileCandidate } from "../../domain/political-profile-candidate";
import type { EntityMatch, EntityResolver } from "../../import-engine/contracts/entity-resolver.contract";

/**
 * Primeira implementação real de EntityResolver (contrato preparado na task
 * do Import Engine). Estratégia mínima e conservadora: compara o slug
 * derivado de `ballotName`/`fullName` contra `PoliticalProfile.slug` já
 * persistidos — só isso. Nenhuma heurística fuzzy (nome parecido,
 * nascimento, etc.) ainda; esse é o espaço que um EntityResolver mais
 * sofisticado ocupará no futuro sem que PoliticalProfileWriter ou
 * PoliticalProfileImportStrategy precisem mudar.
 */
export class PoliticalProfileSlugEntityResolver implements EntityResolver<PoliticalProfileCandidate> {
  constructor(private readonly prisma: PrismaClient) {}

  async resolve(candidate: PoliticalProfileCandidate): Promise<EntityMatch[]> {
    const slug = slugify(candidate.ballotName || candidate.fullName);
    const existing = await this.prisma.politicalProfile.findUnique({ where: { slug }, select: { id: true } });

    if (!existing) return [];

    return [{ entityId: existing.id, score: 1, matchedOn: ["slug"] }];
  }
}
