// CNJ Datajud — tipos de resposta da API pública
// API pública: https://api-publica.datajud.cnj.jus.br/
// Não requer chave para consultas básicas por nome.

export interface CnjProcessoParteAdvogado {
  nome: string;
  numeroOAB?: string;
}

export interface CnjProcessoParte {
  nome: string;
  tipo: string; // "Réu" | "Autor" | "Vítima" | etc.
  cpf?: string;
  advogados?: CnjProcessoParteAdvogado[];
}

export interface CnjMovimento {
  codigo: number;
  nome: string;
  dataHora: string;
  complemento?: string;
}

export interface CnjProcesso {
  id: string;
  numeroProcesso: string;
  tribunal: string;
  // Ex: "1" = 1º grau, "2" = 2º grau
  grau: string;
  dataAjuizamento: string;
  // Ex: "Penal", "Civil", "Administrativo"
  classeProcessual: { codigo: number; nome: string };
  assuntos: { codigo: number; nome: string }[];
  orgaoJulgador: { codigo: string; nome: string; municipio?: string; uf?: string };
  partes: CnjProcessoParte[];
  movimentos: CnjMovimento[];
}

export interface CnjSearchResponse {
  hits: {
    total: { value: number; relation: string };
    hits: Array<{
      _id: string;
      _source: CnjProcesso;
    }>;
  };
}

/** Classificação simplificada de processo por gravidade. */
export type CnjProcessoGravidade = "criminal" | "administrative" | "civil" | "other";

/** Resultado resumido extraído do Datajud para um político. */
export interface CnjPoliticianProfile {
  totalProcessos: number;
  criminaisAtivos: number;
  criminaisEncerrados: number;
  administrativos: number;
  civis: number;
  /** Tribunais onde tem processos (ex: "STF", "STJ", "TJ-SP") */
  tribunais: string[];
  processos: CnjProcesso[];
}
