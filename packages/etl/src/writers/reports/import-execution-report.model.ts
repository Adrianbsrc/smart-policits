/**
 * Resumo de uma execução de importação (docs/SPECs/etl.md#logs: "registros
 * alterados"). Contagens, não detalhes por item — o detalhe por candidato
 * (motivo, id, erro) vai para os logs estruturados via JobContext.logger,
 * nunca duplicado aqui.
 */
export interface ImportExecutionReport {
  imported: number;
  updated: number;
  ignored: number;
  manualReview: number;
  failed: number;
}
