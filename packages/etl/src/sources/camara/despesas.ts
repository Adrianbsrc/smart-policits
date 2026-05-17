import type { CamaraListResponse } from "./types";

const CAMARA_BASE = "https://dadosabertos.camara.leg.br/api/v2";

interface CamaraDespesa {
  ano: number;
  mes: number;
  tipoDespesa: string;
  valorDocumento: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Câmara API ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

/**
 * Verifica se o deputado publicou despesas de gabinete (CEAP).
 *
 * Proxy binário para spendingPublishedRate:
 * - true  → publicou → 100%
 * - false → não publicou (ou sem dados) → 30% (penaliza levemente)
 *
 * A maioria dos deputados publica suas despesas. Ausência de dados é sinal
 * de baixa transparência, não de ausência de gastos.
 */
export async function fetchPublicouDespesas(deputadoId: number): Promise<boolean> {
  const url = `${CAMARA_BASE}/deputados/${deputadoId}/despesas?itens=1&ordem=DESC&ordenarPor=ano`;
  const data = await fetchJson<CamaraListResponse<CamaraDespesa>>(url);
  return data.dados.length > 0;
}
