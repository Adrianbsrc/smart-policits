import type { EvidenceContextScope, EvidenceContextType } from "./evidence-context-type.enum";

/**
 * Evento externo (pandemia, guerra, crise, desastre natural, mudança
 * constitucional) que contextualiza uma ou mais Evidences — nunca as
 * altera diretamente (docs/SPECs/assessment.md#contexto). Uma Evidence pode
 * estar associada a vários Contexts (ver `Evidence.contexts`), e um mesmo
 * Context tipicamente se aplica a Evidences de vários perfis diferentes.
 */
export interface EvidenceContext {
  id: string;
  title: string;
  description: string;
  type: EvidenceContextType;
  scope: EvidenceContextScope;
  startDate: Date;
  endDate: Date | null;
}
