import type { PromiseStatus } from "../models";
import { PROMISE_STATUS_LABELS } from "./promise.view-mapper";
import type { PromiseViewModel } from "./promise.view-model";
import type { PromiseStatusGroupViewModel } from "./promise-group.view-model";

/**
 * Ordem exigida: Cumpridas, Em andamento, Parciais, Não cumpridas,
 * Não verificáveis. "promised" e "revoked" não fazem parte da UX pedida
 * explicitamente, mas o domínio os suporta (ver backend) — aparecem ao
 * final para não quebrar a ordem mandatória dos 5 grupos citados.
 */
const STATUS_GROUP_ORDER: PromiseStatus[] = [
  "fulfilled",
  "in_progress",
  "partial",
  "not_fulfilled",
  "not_verifiable",
  "promised",
  "revoked",
];

/** Agrupa por status na ordem definida acima. Grupos sem promessas não aparecem. */
export function groupPromisesByStatus(promises: PromiseViewModel[]): PromiseStatusGroupViewModel[] {
  const groups = new Map<string, PromiseViewModel[]>();

  for (const promise of promises) {
    const bucket = groups.get(promise.statusLabel);
    if (bucket) bucket.push(promise);
    else groups.set(promise.statusLabel, [promise]);
  }

  return STATUS_GROUP_ORDER.map((status) => PROMISE_STATUS_LABELS[status])
    .filter((statusLabel) => groups.has(statusLabel))
    .map((statusLabel) => ({ statusLabel, promises: groups.get(statusLabel) ?? [] }));
}
