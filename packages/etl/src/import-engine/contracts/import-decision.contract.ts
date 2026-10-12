import type { ImportAction } from "../decisions/import-action.enum";
import type { ImportWarning } from "../models/import-warning.model";

/**
 * Resultado de uma ImportStrategy para um ImportCandidate — nunca executa
 * nada, apenas descreve o que deveria acontecer e o quão confiável é essa
 * decisão. `reason` é obrigatório: toda decisão precisa ser explicável
 * (mesmo princípio de rastreabilidade de docs/SPECs/evidence.md).
 */
export interface ImportDecision {
  action: ImportAction;
  /** 0 (sem confiança) a 1 (certeza total). */
  confidence: number;
  reason: string;
  warnings: ImportWarning[];
  /**
   * Id do registro já existente ao qual UPDATE/MERGE deve se aplicar — vem
   * de `EntityMatch.entityId` (ver entity-resolver.contract.ts). Sempre
   * ausente em CREATE/IGNORE/MANUAL_REVIEW. Um Writer nunca deve inferir
   * esse id a partir de `reason` (texto livre) — só deste campo.
   */
  targetEntityId?: string;
}
