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

interface CamaraResponse<T> {
  dados: T[];
}

@Injectable()
export class CamaraApiService {
  private readonly logger = new Logger(CamaraApiService.name);

  async getVotacoes(deputadoId: string, itens = 20): Promise<CamaraVoto[]> {
    const url = `${CAMARA_BASE}/deputados/${deputadoId}/votacoes?ordem=DESC&ordenarPor=dataHoraRegistro&itens=${itens}`;
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        this.logger.warn(`Câmara API returned ${res.status} for deputado ${deputadoId}`);
        return [];
      }
      const json = await res.json() as CamaraResponse<CamaraVoto>;
      return json.dados ?? [];
    } catch (err) {
      this.logger.error(`Failed to fetch votações for deputado ${deputadoId}`, err);
      return [];
    }
  }
}
