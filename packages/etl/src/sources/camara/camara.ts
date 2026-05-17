import {
  CamaraDeputado,
  CamaraDeputadoDetalhe,
  CamaraListResponse,
  CamaraVoto
} from "./types";

const CAMARA_BASE = "https://dadosabertos.camara.leg.br/api/v2";
const LEGISLATURA = 57; // 2023-2027

async function fetchJson<T>(url: string, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.ok) return res.json() as Promise<T>;
    if (res.status >= 500 && attempt < retries) {
      await new Promise((r) => setTimeout(r, attempt * 2000));
      continue;
    }
    throw new Error(`Câmara API error ${res.status}: ${url}`);
  }
  throw new Error(`Câmara API: max retries exceeded: ${url}`);
}

export async function fetchDeputados(): Promise<CamaraDeputado[]> {
  const all: CamaraDeputado[] = [];
  let page = 1;
  const itens = 100;

  while (true) {
    const url = `${CAMARA_BASE}/deputados?idLegislatura=${LEGISLATURA}&itens=${itens}&pagina=${page}&ordem=ASC&ordenarPor=nome`;
    const data = await fetchJson<CamaraListResponse<CamaraDeputado>>(url);
    all.push(...data.dados);

    const hasNext = data.links.some((l) => l.rel === "next");
    if (!hasNext || data.dados.length === 0) break;
    page++;

    // Polite rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }

  return all;
}

export async function fetchDeputadoDetalhe(id: number): Promise<CamaraDeputadoDetalhe> {
  const url = `${CAMARA_BASE}/deputados/${id}`;
  const data = await fetchJson<{ dados: CamaraDeputadoDetalhe }>(url);
  return data.dados;
}

export async function fetchVotacoes(deputadoId: number, itens = 20): Promise<CamaraVoto[]> {
  const url = `${CAMARA_BASE}/deputados/${deputadoId}/votacoes?ordem=DESC&ordenarPor=dataHoraRegistro&itens=${itens}`;
  const data = await fetchJson<CamaraListResponse<CamaraVoto>>(url);
  return data.dados;
}
