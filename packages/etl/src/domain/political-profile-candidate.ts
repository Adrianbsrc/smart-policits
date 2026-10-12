import type { SourceReliability } from "../sources/source.contract";

/**
 * Contrato interno de candidatura (docs/SPECs/etl.md#2-normalize:
 * "Converte os dados para os contratos internos. Nenhum serviço interno
 * conhece o formato da fonte externa."). Toda fonte que produzir dados de
 * candidatura — TSE hoje; futuramente Câmara/Senado/Portal da Transparência
 * — converge para este formato via seu próprio Normalizer.
 *
 * Independente de qualquer fonte: mesmo que os valores de
 * `CandidateAssetCategory` coincidam hoje com a categorização do TSE
 * (ver sources/tse/tse.client.ts#normalizeTipoAtivo), a união é declarada
 * aqui, não importada de lá — o domínio nunca deve depender de uma fonte
 * específica.
 */
export type CandidateAssetCategory = "imovel" | "veiculo" | "investimento" | "empresa" | "dinheiro" | "outros";

export interface CandidateAsset {
  description: string;
  details: string;
  valueBrl: number;
  category: CandidateAssetCategory;
  /** Rótulo original da fonte para a categoria — nunca descartado (rastreabilidade, etl.md#versionamento). */
  rawCategoryLabel: string;
}

export interface CandidateParty {
  number: string;
  acronym: string;
  name: string;
}

export interface CandidateElection {
  year: number;
  office: "president";
  ballotNumber: string;
}

/** Situação da candidatura, normalizada — o rótulo original da fonte fica em `candidacyStatusLabel`. */
export type CandidacyStatus = "eligible" | "ineligible" | "unknown";

export type CandidateElectoralResult = "elected" | "runner_up" | "not_elected";

/**
 * Um mandato só é "conhecido" quando a fonte confirma o resultado eleitoral
 * — nunca inferido a partir de mera candidatura. O endpoint de candidatos do
 * TSE (usado por TseCollector/TseNormalizer hoje) informa quem se
 * candidatou, não quem venceu; por isso `PoliticalProfileCandidate.knownMandate`
 * é sempre `null` na integração atual. Quando um Collector de resultados
 * eleitorais existir, ele passa a preencher este campo — nenhum outro tipo
 * muda.
 */
export interface CandidateKnownMandate {
  startDate: Date;
  endDate: Date | null;
  electoralResult: CandidateElectoralResult;
}

export interface PoliticalProfileCandidate {
  /** Id estável e independente da fonte: `${sourceId}:${election.year}:${externalId}`. */
  id: string;
  /** Id do candidato na fonte original (ex.: sqcand do TSE). */
  externalId: string;
  fullName: string;
  ballotName: string;
  party: CandidateParty;
  election: CandidateElection;
  candidacyStatus: CandidacyStatus;
  candidacyStatusLabel: string;
  totalAssetsBrl: number;
  assets: CandidateAsset[];
  sourceId: string;
  sourceUrl: string;
  sourceReliability: SourceReliability;
  collectedAt: Date;
  /** Ver CandidateKnownMandate — null enquanto nenhuma fonte de resultado eleitoral existir. */
  knownMandate: CandidateKnownMandate | null;
}
