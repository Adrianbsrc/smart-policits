
export interface CamaraDeputado {
  id: number;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
  urlFoto: string;
  email: string;
}

export interface CamaraDeputadoDetalhe {
  id: number;
  nome: string;
  nomeCivil: string;
  cpf: string;
  sexo: string;
  escolaridade: string;
  situacao: string;
  ultimoStatus: {
    siglaPartido: string;
    siglaUf: string;
    urlFoto: string;
    email: string;
    situacao: string;
  };
}

export interface CamaraVoto {
  id: string;
  tipoVoto: string;
  dataHoraRegistro: string;
  siglaOrgao: string;
  descricao: string;
  uri: string;
}

export interface CamaraListResponse<T> {
  dados: T[];
  links: { rel: string; href: string }[];
}