import { Injectable, Logger } from "@nestjs/common";

const CAMARA_BASE = "https://dadosabertos.camara.leg.br/api/v2";

export interface CamaraVoto {
  id: string;
  tipoVoto: string;
  dataHoraRegistro: string;
  siglaOrgao: string;
  descricao: string;
  uri: string;
}

export interface CamaraProposicoesResult {
  proposed: number;
  approved: number;
}

interface CamaraResponse<T> {
  dados: T[];
  links?: { rel: string; href: string }[];
}

@Injectable()
export class CamaraApiService {
  private readonly logger = new Logger(CamaraApiService.name);

  private async fetchJson<T>(url: string): Promise<T | null> {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        this.logger.warn(`Câmara API ${res.status}: ${url}`);
        return null;
      }
      return res.json() as Promise<T>;
    } catch (err) {
      this.logger.error(`Câmara API fetch error: ${url}`, err);
      return null;
    }
  }

  async getVotacoes(deputadoId: string, itens = 150): Promise<CamaraVoto[]> {
    const url = `${CAMARA_BASE}/deputados/${deputadoId}/votacoes?ordem=DESC&ordenarPor=dataHoraRegistro&itens=${itens}`;
    const json = await this.fetchJson<CamaraResponse<CamaraVoto>>(url);
    return json?.dados ?? [];
  }

  async getProposicoes(deputadoId: string): Promise<CamaraProposicoesResult> {
    const [allRes, approvedRes] = await Promise.all([
      this.fetchJson<CamaraResponse<{ id: number }>>(
        `${CAMARA_BASE}/proposicoes?idAutor=${deputadoId}&itens=100&ordem=DESC&ordenarPor=id`,
      ),
      this.fetchJson<CamaraResponse<{ id: number }>>(
        `${CAMARA_BASE}/proposicoes?idAutor=${deputadoId}&codSituacao=1140&itens=50`,
      ),
    ]);

    const hasMore = allRes?.links?.some((l) => l.rel === "next") ?? false;
    return {
      proposed: hasMore ? 100 : (allRes?.dados.length ?? 0),
      approved: approvedRes?.dados.length ?? 0,
    };
  }

  async getPublicouDespesas(deputadoId: string): Promise<boolean> {
    const url = `${CAMARA_BASE}/deputados/${deputadoId}/despesas?itens=1&ordem=DESC&ordenarPor=ano`;
    const json = await this.fetchJson<CamaraResponse<unknown>>(url);
    return (json?.dados.length ?? 0) > 0;
  }
}
