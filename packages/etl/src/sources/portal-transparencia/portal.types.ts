// Portal da Transparência — API de Dados Abertos
// Cadastro gratuito: https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email

export interface PortalViagemTrecho {
  origem: string;
  destino: string;
  saida: string;   // "DD/MM/YYYY HH:mm:ss"
  chegada: string;
}

export interface PortalViagem {
  id: string;
  nome: string;
  cpf?: string;
  cargo: string;
  orgao: { nome: string; siglaSuperior: string };
  periodo: { dataInicio: string; dataFim: string };
  situacao: string;
  valorPassagens: number;
  totalDiarias: number;
  valorDiarias: number;
  valorOtherExpenses?: number;
}

export interface PortalDiaria {
  id: string;
  nome: string;
  cpf?: string;
  cargo: string;
  orgao: { nome: string };
  periodo: { dataInicio: string; dataFim: string };
  quantidade: number;
  valorTotal: number;
  destinos: string[];
}

export interface PortalCartaoItem {
  id: string;
  nome: string;
  cpf?: string;
  cargo: string;
  orgao: { nome: string };
  dataTransacao: string;
  valor: number;
  estabelecimento: string;
  cnpj?: string;
  categoria: string;
}

export interface PortalPaginado<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItens: number;
  totalPaginas: number;
}
