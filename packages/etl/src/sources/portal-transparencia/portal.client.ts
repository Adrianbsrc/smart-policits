/**
 * Portal da Transparência — cliente HTTP para dados públicos federais.
 *
 * Requer chave gratuita: https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email
 * Limite: 500 requisições/hora por chave.
 *
 * Cobre dados do Executivo federal — para estados, usar portais estaduais individualmente.
 */
import type { PortalCartaoItem, PortalDiaria, PortalPaginado, PortalViagem } from "./portal.types";

const PORTAL_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";

export class PortalTransparenciaClient {
  private readonly headers: Record<string, string>;

  constructor(apiKey: string) {
    this.headers = {
      "chave-api-dados": apiKey,
      Accept: "application/json",
    };
  }

  private async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${PORTAL_BASE}${path}`);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString(), {
      headers: this.headers,
      signal: AbortSignal.timeout(15_000),
    });

    if (res.status === 401) throw new Error("Portal da Transparência: chave inválida ou expirada");
    if (res.status === 429) throw new Error("Portal da Transparência: rate limit atingido (500 req/h)");
    if (!res.ok) throw new Error(`Portal da Transparência: HTTP ${res.status} em ${path}`);

    return res.json() as Promise<T>;
  }

  /** Viagens a serviço de um servidor pelo nome (parcial). */
  async fetchViagens(nome: string, ano: number): Promise<PortalViagem[]> {
    const dataInicio = `01/01/${ano}`;
    const dataFim    = `31/12/${ano}`;
    const data = await this.get<PortalPaginado<PortalViagem>>("/viagens", {
      nome,
      dataIdaInicio: dataInicio,
      dataIdaFim:    dataFim,
      pagina: "1",
    });
    return data.data ?? [];
  }

  /** Diárias pagas a um servidor pelo nome. */
  async fetchDiarias(nome: string, ano: number): Promise<PortalDiaria[]> {
    const data = await this.get<PortalPaginado<PortalDiaria>>("/diarias", {
      nome,
      dataInicioPagamento: `01/01/${ano}`,
      dataFimPagamento:    `31/12/${ano}`,
      pagina: "1",
    });
    return data.data ?? [];
  }

  /**
   * Gastos com cartão corporativo / cartão de pagamento.
   * Cobre ministros, presidentes, servidores de alto escalão.
   */
  async fetchGastosCartao(nome: string, mes: number, ano: number): Promise<PortalCartaoItem[]> {
    const mesStr = String(mes).padStart(2, "0");
    const data = await this.get<PortalPaginado<PortalCartaoItem>>("/cartoes", {
      nome,
      mesAnoReferencia: `${mesStr}/${ano}`,
      pagina: "1",
    });
    return data.data ?? [];
  }

  /**
   * Resumo anual de gastos de um político que exerce cargo federal.
   * Retorna total de viagens, diárias e cartão para o ano.
   */
  async fetchResumoGastos(
    nome: string,
    ano: number,
  ): Promise<{ viagens: number; diarias: number; totalBrl: number }> {
    const [viagens, diarias] = await Promise.all([
      this.fetchViagens(nome, ano).catch(() => [] as PortalViagem[]),
      this.fetchDiarias(nome, ano).catch(() => [] as PortalDiaria[]),
    ]);

    const totalViagens  = viagens.reduce((s, v) => s + (v.valorPassagens ?? 0) + (v.valorDiarias ?? 0), 0);
    const totalDiarias  = diarias.reduce((s, d) => s + (d.valorTotal ?? 0), 0);

    return {
      viagens:  viagens.length,
      diarias:  diarias.length,
      totalBrl: totalViagens + totalDiarias,
    };
  }
}

/** Retorna null se a chave não estiver configurada (não quebra o ETL). */
export function createPortalClient(apiKey: string | undefined): PortalTransparenciaClient | null {
  if (!apiKey?.trim()) return null;
  return new PortalTransparenciaClient(apiKey.trim());
}
