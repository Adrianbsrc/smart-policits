import type { IntegrityStatus } from "../models";
import { INTEGRITY_STATUS_LABELS } from "./integrity-record.view-mapper";
import type { IntegrityRecordViewModel } from "./integrity-record.view-model";
import type { IntegrityStatusGroupViewModel } from "./integrity-group.view-model";

/**
 * Ordem neutra (a mesma ordem em que a SPEC lista os status) — nunca
 * ordenar por "gravidade" ou colocar condenações em destaque, para não
 * induzir julgamento. Todo status aparece sempre, mesmo com 1 registro —
 * nunca ocultar absolvições, arquivamentos ou investigações.
 */
const STATUS_ORDER: IntegrityStatus[] = ["investigation", "archived", "acquitted", "convicted", "ongoing", "unknown"];

export function groupIntegrityRecordsByStatus(records: IntegrityRecordViewModel[]): IntegrityStatusGroupViewModel[] {
  const groups = new Map<string, IntegrityRecordViewModel[]>();

  for (const record of records) {
    const bucket = groups.get(record.statusLabel);
    if (bucket) bucket.push(record);
    else groups.set(record.statusLabel, [record]);
  }

  return STATUS_ORDER.map((status) => INTEGRITY_STATUS_LABELS[status])
    .filter((statusLabel) => groups.has(statusLabel))
    .map((statusLabel) => {
      const statusRecords = groups.get(statusLabel) ?? [];
      return { statusLabel, count: statusRecords.length, records: statusRecords };
    });
}
