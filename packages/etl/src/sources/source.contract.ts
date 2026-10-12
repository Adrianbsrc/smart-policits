export type SourceType = "api" | "csv" | "xml" | "json" | "rss" | "html_scraping" | "manual_import";

export type SourceReliability = "official" | "very_high" | "high" | "medium" | "low";

export type SourceStatus = "active" | "inactive" | "degraded";

export type SourceUpdateFrequency =
  | "real_time"
  | "daily"
  | "weekly"
  | "monthly"
  | "electoral"
  | "on_publication";

/**
 * Metadados de uma fonte de dados (docs/SPECs/sources.md#campos). Toda
 * informação exibida ao usuário deve ter ao menos uma Source associada.
 */
export interface SourceDefinition {
  readonly id: string;
  readonly name: string;
  readonly organization: string;
  readonly type: SourceType;
  readonly baseUrl: string;
  readonly documentationUrl?: string;
  readonly updateFrequency: SourceUpdateFrequency;
  readonly reliability: SourceReliability;
  readonly status: SourceStatus;
  /** Id do Collector (ver contracts/collector.contract.ts) que atende esta Source. */
  readonly collectorId: string;
  readonly notes?: string;
}
