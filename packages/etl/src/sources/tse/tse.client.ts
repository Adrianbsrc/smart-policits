/**
 * TSE DivulgaCandContas — cliente HTTP para dados públicos de candidaturas.
 *
 * API pública, sem autenticação.
 * Documentação informal: https://divulgacandcontas.tse.jus.br/divulga/#/
 *
 * Códigos de cargo:
 *   1 = Presidente da República
 *   3 = Senador
 *   5 = Governador de Estado
 *   6 = Deputado Federal
 *   7 = Deputado Estadual / Distrital
 */
import type { TseBem, TseBensResponse, TseCandidato, TseCandidatosResponse } from "./tse.types";

const TSE_BASE = "https://divulgacandcontas.tse.jus.br/divulga/rest/v1";

const FETCH_OPTS: RequestInit = {
  headers: { Accept: "application/json", "User-Agent": "SmartPolitics/1.0 (+https://smartpolitics.com.br)" },
  signal: AbortSignal.timeout(15_000),
};

/** Converte string de valor TSE ("1.234.567,89" ou "1234567.89") para float. */
export function parseTseValue(raw: string): number {
  if (!raw) return 0;
  // Remove R$, espaços, pontos de milhar, troca vírgula decimal por ponto
  const cleaned = raw.replace(/R\$\s*/g, "").replace(/\./g, "").replace(",", ".");
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

export type TseAssetCategory = "imovel" | "veiculo" | "investimento" | "empresa" | "dinheiro" | "outros";

/** Normaliza o tipo de bem TSE para ExpenseCategory do nosso schema. */
export function normalizeTipoAtivo(descricao: string): TseAssetCategory {
  const d = descricao.toLowerCase();
  if (d.includes("imóvel") || d.includes("imovel") || d.includes("terreno")) return "imovel";
  if (d.includes("veículo") || d.includes("veiculo") || d.includes("automóvel")) return "veiculo";
  if (d.includes("aplicação") || d.includes("poupança") || d.includes("fundo") || d.includes("ação")) return "investimento";
  if (d.includes("empresa") || d.includes("sociedade") || d.includes("participação")) return "empresa";
  if (d.includes("dinheiro") || d.includes("numerário") || d.includes("espécie")) return "dinheiro";
  return "outros";
}

/**
 * Lista candidatos de um cargo e UF para um ano eleitoral.
 * Itera páginas automaticamente.
 */
export async function fetchCandidatosByElection(
  ano: number,
  uf: string,
  codigoCargo: number,
): Promise<TseCandidato[]> {
  const all: TseCandidato[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${TSE_BASE}/candidatura/listar/${ano}/${uf.toUpperCase()}/${codigoCargo}/${page}/candidatos`;
    const res = await fetch(url, FETCH_OPTS);
    if (!res.ok) {
      if (res.status === 404) break; // Sem candidatos nessa combinação
      throw new Error(`TSE candidatos ${ano}/${uf}/${codigoCargo} p${page}: HTTP ${res.status}`);
    }
    const data = (await res.json()) as TseCandidatosResponse;
    all.push(...(data.candidatos ?? []));
    totalPages = data.totalDePaginas ?? 1;
    page++;
    // Evitar rate-limit da API do TSE
    if (page <= totalPages) await new Promise((r) => setTimeout(r, 300));
  }

  return all;
}

/**
 * Busca declaração de bens de um candidato específico.
 * Retorna array vazio se candidato não declarou bens.
 */
export async function fetchBensByCandidato(
  ano: number,
  uf: string,
  codigoCargo: number,
  sqcand: string,
): Promise<TseBem[]> {
  const url = `${TSE_BASE}/candidatura/listar/${ano}/${uf.toUpperCase()}/${codigoCargo}/${sqcand}/bens`;
  const res = await fetch(url, FETCH_OPTS);
  if (!res.ok) {
    if (res.status === 404 || res.status === 400) return [];
    throw new Error(`TSE bens ${sqcand}: HTTP ${res.status}`);
  }
  const data = (await res.json()) as TseBensResponse;
  return data.lista ?? [];
}

/**
 * Busca declaração de bens de todos os candidatos a presidente em um ano.
 * Retorna mapa: sqcand → { candidato, bens }
 */
export async function fetchAllPresidentialBens(
  ano: number,
): Promise<Map<string, { candidato: TseCandidato; bens: TseBem[]; totalBrl: number }>> {
  const result = new Map<string, { candidato: TseCandidato; bens: TseBem[]; totalBrl: number }>();

  const candidatos = await fetchCandidatosByElection(ano, "BR", 1);

  for (const candidato of candidatos) {
    const bens = await fetchBensByCandidato(ano, "BR", 1, candidato.id);
    const totalBrl = parseTseValue(candidato.totalDeBens);
    result.set(candidato.id, { candidato, bens, totalBrl });
    await new Promise((r) => setTimeout(r, 400)); // 400ms entre candidatos
  }

  return result;
}

/**
 * Busca bens de candidatos a governador de um estado específico.
 */
export async function fetchGovernorBens(
  ano: number,
  uf: string,
): Promise<Map<string, { candidato: TseCandidato; bens: TseBem[]; totalBrl: number }>> {
  const result = new Map<string, { candidato: TseCandidato; bens: TseBem[]; totalBrl: number }>();

  const candidatos = await fetchCandidatosByElection(ano, uf, 5); // cargo 5 = governador

  for (const candidato of candidatos) {
    const bens = await fetchBensByCandidato(ano, uf, 5, candidato.id);
    const totalBrl = parseTseValue(candidato.totalDeBens);
    result.set(candidato.id, { candidato, bens, totalBrl });
    await new Promise((r) => setTimeout(r, 300));
  }

  return result;
}
