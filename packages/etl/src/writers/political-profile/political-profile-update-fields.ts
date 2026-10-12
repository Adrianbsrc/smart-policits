import type { Prisma } from "@smart-politics/db";

import type { PoliticalProfileCandidate } from "../../domain/political-profile-candidate";

/**
 * Único ponto que decide quais campos de PoliticalProfile um UPDATE
 * automático (vindo do TSE) pode tocar — "estratégia de UPDATE seguro".
 *
 * Deliberadamente NUNCA inclui:
 * - `biography`, `photo`, `birthDate`, `birthPlace`: o TSE não fornece esses
 *   dados — um UPDATE automático nunca deve poder apagá-los (nulificar um
 *   valor já curado manualmente).
 * - `status`, `currentOfficeId`, `isIncumbent`: exigem julgamento sobre o
 *   momento de vida pública do perfil (candidato vs. em mandato vs. ex-
 *   mandatário) que uma candidatura isolada, sozinha, não pode decidir.
 * - `slug`: mudar o slug de um perfil já existente quebraria links públicos.
 *
 * Somente `fullName`, `displayName` e `isCandidate` — fatos que o TSE de
 * fato confirma a cada candidatura — podem ser atualizados automaticamente.
 * Ampliar esta lista deve ser uma decisão deliberada, revisada aqui, nunca
 * um efeito colateral de outro código.
 */
export function buildSafeProfileUpdate(candidate: PoliticalProfileCandidate): Prisma.PoliticalProfileUpdateInput {
  return {
    fullName: candidate.fullName,
    displayName: candidate.ballotName,
    isCandidate: true,
  };
}
