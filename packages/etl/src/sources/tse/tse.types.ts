// TSE DivulgaCandContas API — tipos de resposta
// Base URL: https://divulgacandcontas.tse.jus.br/divulga/rest/v1/

export interface TsePartido {
  numero: string;
  sigla: string;
  nome: string;
}

export interface TseCargo {
  codigo: string;
  nome: string;
}

export interface TseSituacao {
  codigo: string;
  nome: string; // "Apto", "Inapto", etc.
}

export interface TseCandidato {
  id: string;         // sequencial do candidato (sqcand)
  numero: string;     // número na urna
  nome: string;
  nomeUrna: string;
  descricaoSexo: string;
  partido: TsePartido;
  cargo: TseCargo;
  totalDeBens: string; // valor formatado "R$ 1.234.567,89" — pode ser vazio
  situacao: TseSituacao;
}

export interface TseCandidatosResponse {
  candidatos: TseCandidato[];
  paginaAtual: number;
  totalDeElementos: number;
  totalDePaginas: number;
}

export interface TseTipoBem {
  codigo: string;
  descricao: string;
}

export interface TseBem {
  ordem: string;
  descricaoDeBem: string;
  detalhesDoBem: string;
  valor: string; // decimal em string, ex: "1234567.89" ou "1.234.567,89"
  tipoDeBem: TseTipoBem;
}

export interface TseBensResponse {
  candidato?: {
    id: string;
    nome: string;
    nomeUrna: string;
    partido: TsePartido;
    totalDeBens: string;
  };
  lista: TseBem[];
}
