import type { Source } from "@smart-politics/core";
import type { IntegrityCategory } from "./integrity-category.enum";
import type { IntegrityStatus } from "./integrity-status.enum";

/**
 * Camada de domínio (framework/Prisma-agnóstica) do módulo Integrity.
 *
 * Princípio da SPEC: o módulo apresenta fatos, nunca opiniões/acusações/
 * conclusões. Nenhum campo aqui deve carregar julgamento (ex: nada de
 * "severity"/"guilt" — apenas status processual objetivo e fonte).
 */
export interface IntegrityEvidence {
  id: string;
  title: string;
  description: string;
  occurredAt: Date;
  source: Source;
}

export interface IntegrityRecord {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: IntegrityCategory;
  status: IntegrityStatus;
  occurredAt: Date;
  source: Source;
  evidences: IntegrityEvidence[];
}
