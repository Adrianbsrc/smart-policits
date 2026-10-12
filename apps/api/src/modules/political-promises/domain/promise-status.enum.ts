/**
 * docs/SPECs/promise.md define 7 status. A UX desta task pede agrupamento
 * explícito de apenas 5 ("Cumpridas, Em andamento, Parciais, Não cumpridas,
 * Não verificáveis"); mantemos o vocabulário completo aqui no domínio para
 * já suportar os dados que o ETL vier a trazer sem precisar expandir este
 * enum depois (ver political-promises.service.ts).
 */
export const PROMISE_STATUSES = [
  "promised",
  "in_progress",
  "partial",
  "fulfilled",
  "not_fulfilled",
  "not_verifiable",
  "revoked",
] as const;

export type PromiseStatus = (typeof PROMISE_STATUSES)[number];
