/**
 * Alerta estruturado anexado a uma ImportDecision — nunca apenas texto solto,
 * para que um futuro backoffice (docs/SPECs/etl.md#backoffice) possa
 * filtrar/agrupar por `code` em vez de fazer parsing de mensagem.
 */
export interface ImportWarning {
  code: string;
  message: string;
}
