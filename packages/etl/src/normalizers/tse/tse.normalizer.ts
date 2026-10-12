import type { Normalizer } from "../../contracts/normalizer.contract";
import type { JobContext } from "../../contracts/job.contract";
import type { TseRawCandidacy } from "../../collectors/tse/tse.collector";
import type { CandidacyStatus, CandidateAsset, PoliticalProfileCandidate } from "../../domain/political-profile-candidate";
import { normalizeTipoAtivo, parseTseValue } from "../../sources/tse/tse.client";
import type { TseBem } from "../../sources/tse/tse.types";

const DECLARATION_BASE_URL = "https://divulgacandcontas.tse.jus.br/divulga/#/candidato";

/**
 * Converte a situação bruta do TSE (texto livre, ex.: "APTO", "INAPTO",
 * "INDEFERIDO COM RECURSO") para o vocabulário interno. O rótulo original é
 * sempre preservado em `candidacyStatusLabel` — nunca descartado
 * (rastreabilidade, docs/SPECs/etl.md#versionamento).
 */
function normalizeCandidacyStatus(situacaoNome: string): CandidacyStatus {
  const normalized = situacaoNome.trim().toLowerCase();
  if (normalized.includes("inapto") || normalized.includes("indeferid") || normalized.includes("cassad")) {
    return "ineligible";
  }
  if (normalized.includes("apto")) return "eligible";
  return "unknown";
}

function normalizeAsset(bem: TseBem): CandidateAsset {
  return {
    description: bem.descricaoDeBem,
    details: bem.detalhesDoBem,
    valueBrl: parseTseValue(bem.valor),
    category: normalizeTipoAtivo(bem.tipoDeBem?.descricao ?? ""),
    rawCategoryLabel: bem.tipoDeBem?.descricao ?? "",
  };
}

/**
 * Converte `TseRawCandidacy` (formato bruto do TSE) para `PoliticalProfileCandidate`
 * (contrato interno, docs/SPECs/etl.md#2-normalize). Nenhum outro estágio do
 * pipeline conhece o formato do TSE — apenas este Normalizer e o
 * `TseCollector`.
 */
export class TseNormalizer implements Normalizer<TseRawCandidacy, PoliticalProfileCandidate> {
  normalize(raw: TseRawCandidacy, context: JobContext): PoliticalProfileCandidate {
    const { ano, candidato, bens } = raw;

    const assets = bens.map(normalizeAsset);
    const totalFromCandidato = parseTseValue(candidato.totalDeBens);
    const totalAssetsBrl = totalFromCandidato || assets.reduce((sum, asset) => sum + asset.valueBrl, 0);

    context.logger.info(`Normalizado candidato ${candidato.nomeUrna || candidato.nome} (${ano})`, {
      sourceId: context.sourceId,
      externalId: candidato.id,
    });

    return {
      id: `tse:${ano}:${candidato.id}`,
      externalId: candidato.id,
      fullName: candidato.nome,
      ballotName: candidato.nomeUrna || candidato.nome,
      party: {
        number: candidato.partido.numero,
        acronym: candidato.partido.sigla,
        name: candidato.partido.nome,
      },
      election: {
        year: ano,
        office: "president",
        ballotNumber: candidato.numero,
      },
      candidacyStatus: normalizeCandidacyStatus(candidato.situacao.nome),
      candidacyStatusLabel: candidato.situacao.nome,
      totalAssetsBrl,
      assets,
      sourceId: "tse",
      sourceUrl: `${DECLARATION_BASE_URL}/${ano}/BR/1/${candidato.id}/bens`,
      sourceReliability: "official",
      collectedAt: new Date(),
      // O endpoint de candidatos do TSE informa quem se candidatou, nunca quem
      // venceu — knownMandate só é preenchido por um futuro Collector de
      // resultados eleitorais (ver domain/political-profile-candidate.ts).
      knownMandate: null,
    };
  }
}
