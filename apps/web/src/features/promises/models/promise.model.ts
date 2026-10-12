import type { Source } from "@smart-politics/core";
import type { PromiseCategoryDto, PromiseStatusDto } from "../validations";

/**
 * O vocabulário de categoria/status é compartilhado com o DTO (o valor em
 * si não muda) — reaproveitar o tipo aqui evita duplicar a lista de
 * literais.
 */
export type PromiseCategory = PromiseCategoryDto;
export type PromiseStatus = PromiseStatusDto;

export interface PromiseEvidenceModel {
  id: string;
  title: string;
  description: string;
  occurredAt: Date;
  source: Source;
}

/**
 * Domain Model — representação de domínio pura. NUNCA conhece a UI: sem
 * labels, sem cores (isso é apresentação — ver view-models/).
 */
export interface PromiseModel {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: PromiseCategory;
  status: PromiseStatus;
  promisedAt: Date;
  dueDate: Date | null;
  completionPercentage: number;
  evidences: PromiseEvidenceModel[];
  source: Source;
}
