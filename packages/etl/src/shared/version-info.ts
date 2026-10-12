/**
 * Metadados de versionamento de um registro persistido (docs/SPECs/etl.md#versionamento).
 * Toda escrita gera uma nova versão — o histórico nunca é apagado.
 */
export interface VersionInfo {
  readonly version: number;
  readonly occurredAt: Date;
  readonly origin: string;
  readonly actor: string;
}
