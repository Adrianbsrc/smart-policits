import type { CamaraListResponse } from "./types";

const CAMARA_BASE = "https://dadosabertos.camara.leg.br/api/v2";

export interface CamaraOrgao {
  idOrgao: number;
  siglaOrgao: string;
  nomeOrgao: string;
  cargo: string;
  dataInicio: string;
  dataFim: string | null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Câmara API ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

/**
 * Retorna as comissões em que o deputado está registrado (titular ou suplente).
 * Endpoint: GET /deputados/{id}/orgaos
 */
export async function fetchOrgaos(deputadoId: number): Promise<CamaraOrgao[]> {
  try {
    const url = `${CAMARA_BASE}/deputados/${deputadoId}/orgaos?itens=100&ordem=DESC&ordenarPor=dataInicio`;
    const data = await fetchJson<CamaraListResponse<CamaraOrgao>>(url);
    return data.dados;
  } catch {
    return [];
  }
}

/**
 * Calcula participação em comissões (0–100).
 * Deputados federais têm em média 2–3 comissões como titular.
 * 0 = 0, 1 = 33, 2 = 67, 3+ = 100.
 */
export function calcCommitteeParticipation(orgaos: CamaraOrgao[]): number {
  const titulares = orgaos.filter((o) => o.cargo === "Titular").length;
  return Math.min(100, Math.round((titulares / 3) * 100));
}
