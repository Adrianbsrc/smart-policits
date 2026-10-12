import type { TseBem, TseCandidato } from "../../sources/tse/tse.types";

export interface TseCandidatosQuery {
  ano: number;
  uf: string;
  codigoCargo: number;
}

export interface TseBensQuery extends TseCandidatosQuery {
  sqcand: string;
}

/**
 * Porta (Ports & Adapters) para a origem dos dados brutos do TSE. `TseCollector`
 * depende apenas desta interface — nunca de HTTP nem de arquivo diretamente.
 *
 * Hoje só existe `TseFixtureDataSource` (fixtures/tse/*.json). Quando o TSE
 * real entrar, basta criar `TseHttpDataSource implements TseDataSource`
 * (envolvendo `fetchCandidatosByElection`/`fetchBensByCandidato`, já
 * existentes em `../../sources/tse/tse.client.ts`) e trocar a implementação
 * injetada em `TseCollector` — nenhuma linha do Collector muda.
 */
export interface TseDataSource {
  listCandidatos(query: TseCandidatosQuery): Promise<TseCandidato[]>;
  listBens(query: TseBensQuery): Promise<TseBem[]>;
}
