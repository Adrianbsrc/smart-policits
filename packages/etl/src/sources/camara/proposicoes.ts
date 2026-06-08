import type { CamaraListResponse } from "./types";

const CAMARA_BASE = "https://dadosabertos.camara.leg.br/api/v2";

interface CamaraProposicao {
  id: number;
  siglaTipo: string;
  numero: number;
  ano: number;
  ementa: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Câmara API ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

export interface ProposicoesResult {
  proposed: number;
  approved: number;
}

/**
 * Busca contagem de proposições do deputado.
 * - proposed: total de propostas apresentadas (capped em 150)
 * - approved: propostas que se tornaram norma jurídica (codSituacao=1140)
 */
export async function fetchProposicoesDeputado(
  deputadoId: number,
): Promise<ProposicoesResult> {
  try {
    const baseUrl = `${CAMARA_BASE}/proposicoes?idAutor=${deputadoId}&itens=100&ordem=DESC&ordenarPor=id`;
    const [allData, approvedData] = await Promise.all([
      fetchJson<CamaraListResponse<CamaraProposicao>>(baseUrl),
      fetchJson<CamaraListResponse<CamaraProposicao>>(
        `${CAMARA_BASE}/proposicoes?idAutor=${deputadoId}&codSituacao=1140&itens=50`,
      ),
    ]);
    const hasMore = allData.links.some((l) => l.rel === "next");
    return {
      proposed: hasMore ? 100 : allData.dados.length,
      approved: approvedData.dados.length,
    };
  } catch {
    return { proposed: 0, approved: 0 };
  }
}
