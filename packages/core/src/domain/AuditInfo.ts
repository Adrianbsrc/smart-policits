/**
 * Value Object — metadados de auditoria (criação/atualização) compartilhados
 * entre backend e frontend. Espelha o princípio do RFC-006: toda entidade
 * auditável possui createdAt/updatedAt. Datas em formato ISO string, que é
 * a forma real como trafegam pela fronteira JSON entre API e cliente.
 *
 * Apenas estrutura — nenhuma regra de negócio implementada.
 */
export interface AuditInfo {
  createdAt: string;
  updatedAt: string;
}
