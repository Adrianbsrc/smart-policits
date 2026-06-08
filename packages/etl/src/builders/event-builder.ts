import type { CamaraVoto } from "../sources/camara/types";

export interface PoliticalEventInput {
  politicianId: string;
  type: "vote";
  title: string;
  description: string;
  eventDate: Date;
  externalId: string;
  sourceUrl?: string;
  sourceLabel: string;
  metadata: Record<string, string>;
}

/**
 * Converte um voto da API da Câmara em um PoliticalEventInput pronto para upsert.
 * O externalId garante idempotência: sincronizações repetidas não geram duplicatas.
 */
export function buildVoteEvent(
  politicianId: string,
  voto: CamaraVoto,
): PoliticalEventInput {
  const descricao = voto.descricao?.trim() || "Votação parlamentar";
  const title = `Votação: ${descricao.slice(0, 100)}${descricao.length > 100 ? "..." : ""}`;

  const sourceUrl = voto.uri
    ? `https://dadosabertos.camara.leg.br${new URL(voto.uri).pathname}`
    : undefined;

  return {
    politicianId,
    type: "vote",
    title,
    description: descricao,
    eventDate: new Date(voto.dataHoraRegistro),
    externalId: `camara-voto-${voto.id}`,
    sourceUrl,
    sourceLabel: "Câmara dos Deputados",
    metadata: {
      tipoVoto: voto.tipoVoto,
      siglaOrgao: voto.siglaOrgao,
    },
  };
}
