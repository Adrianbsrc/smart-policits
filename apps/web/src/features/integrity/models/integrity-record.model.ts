import type { Source } from "@smart-politics/core";
import type { IntegrityCategoryDto, IntegrityStatusDto } from "../validations";

/**
 * Domain Model — representação de domínio pura. NUNCA conhece a UI: sem
 * labels, sem cores. O princípio da SPEC ("a plataforma informa, o usuário
 * conclui") vale também aqui — nenhum campo deriva julgamento, só fatos
 * (status processual objetivo, categoria, datas, fonte).
 *
 * Vocabulário de categoria/status compartilhado com o DTO — reaproveitar o
 * tipo aqui evita duplicar a lista de literais.
 */
export type IntegrityCategory = IntegrityCategoryDto;
export type IntegrityStatus = IntegrityStatusDto;

export interface IntegrityEvidenceModel {
  id: string;
  title: string;
  description: string;
  occurredAt: Date;
  source: Source;
}

export interface IntegrityRecordModel {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: IntegrityCategory;
  status: IntegrityStatus;
  occurredAt: Date;
  source: Source;
  evidences: IntegrityEvidenceModel[];
}
