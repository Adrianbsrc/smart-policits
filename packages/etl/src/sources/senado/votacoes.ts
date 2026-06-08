const BASE_URL = "https://legis.senado.leg.br/dadosabertos";

export interface SenadoVoto {
  CodigoSessao: string;
  DescricaoVotacao: string;
  VotoParlamentar: string;
}

interface SenadoVotacoesResponse {
  ParlamentarVotacoes?: {
    Votacoes?: {
      Votacao?: SenadoVoto | SenadoVoto[];
    };
  };
}

const VOTOS_PRESENCA = new Set(["Sim", "Não", "Abstenção", "P-OD", "Obstrução"]);

/**
 * Busca votações registradas do senador.
 * Endpoint: GET /senador/{codigo}/votacoes
 * Retorna array vazio se o endpoint falhar (API instável).
 */
export async function fetchSenadorVotacoes(senadoId: string): Promise<SenadoVoto[]> {
  const url = `${BASE_URL}/senador/${senadoId}/votacoes`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const json = (await res.json()) as SenadoVotacoesResponse;
  const raw = json.ParlamentarVotacoes?.Votacoes?.Votacao;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/**
 * Calcula taxa de presença em votações plenárias do Senado (0–100).
 * Referência: 120 votos = presença ideal (senadores votam menos que deputados).
 */
export function calcSenadorPresenceRate(votacoes: SenadoVoto[]): number {
  if (votacoes.length === 0) return 0;
  const present = votacoes.filter((v) => VOTOS_PRESENCA.has(v.VotoParlamentar)).length;
  const BASE_EXPECTED = 120;
  return Math.min(100, Math.round((present / BASE_EXPECTED) * 100));
}
