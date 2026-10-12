import type { Source } from "@smart-politics/core";
import type { PromiseCategory } from "./promise-category.enum";
import type { PromiseStatus } from "./promise-status.enum";

/**
 * Camada de domínio (framework/Prisma-agnóstica) do módulo Promises.
 *
 * Nota de nomenclatura: a SPEC/task pede uma entidade "Promise", mas esse
 * nome colide com o tipo global `Promise<T>` do TypeScript/JS — declarar uma
 * interface `Promise` neste arquivo sombrearia o tipo embutido para qualquer
 * arquivo que a importe, quebrando silenciosamente todo uso de `async`/
 * `Promise<T>` nesses arquivos. Por isso o domínio usa `PromiseEntity`.
 */
export interface PromiseEvidence {
  id: string;
  title: string;
  description: string;
  occurredAt: Date;
  source: Source;
}

export interface PromiseEntity {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: PromiseCategory;
  status: PromiseStatus;
  promisedAt: Date;
  dueDate: Date | null;
  /** 0–100 */
  completionPercentage: number;
  evidences: PromiseEvidence[];
  source: Source;
}
