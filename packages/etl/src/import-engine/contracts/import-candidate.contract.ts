/**
 * Envelope de um objeto normalizado pelo ETL (ex.: `PoliticalProfileCandidate`,
 * ver ../../domain/political-profile-candidate.ts) chegando ao Import Engine.
 *
 * `type` é o discriminador usado pelo ImportStrategyRegistry para rotear ao
 * ImportStrategy correto (docs/SPECs/etl.md#2-normalize → contrato interno).
 * Nenhum Collector grava no banco — este é o envelope que sai do pipeline
 * ETL e entra no Import Engine, nunca o inverso.
 */
export interface ImportCandidate<T> {
  /** Identifica o tipo do payload — mesmo valor de `ImportStrategy.type`. */
  readonly type: string;
  /** Id da Source de origem (ex.: "tse") — rastreabilidade (docs/SPECs/etl.md#versionamento). */
  readonly sourceId: string;
  readonly collectedAt: Date;
  readonly payload: T;
}
