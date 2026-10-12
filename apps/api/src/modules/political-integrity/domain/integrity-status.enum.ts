/**
 * Estados processuais — todos devem sempre ser apresentados ao usuário
 * (nunca ocultar absolvições, arquivamentos ou investigações).
 */
export const INTEGRITY_STATUSES = [
  "investigation",
  "archived",
  "acquitted",
  "convicted",
  "ongoing",
  "unknown",
] as const;

export type IntegrityStatus = (typeof INTEGRITY_STATUSES)[number];
