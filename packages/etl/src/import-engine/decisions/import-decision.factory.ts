import type { ImportDecision } from "../contracts/import-decision.contract";
import type { ImportWarning } from "../models/import-warning.model";
import type { ImportAction } from "./import-action.enum";

/** Garante que toda ImportDecision tenha confidence dentro de [0, 1], não importa quem a construiu. */
function clampConfidence(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function build(
  action: ImportAction,
  reason: string,
  confidence: number,
  warnings: ImportWarning[],
  targetEntityId?: string,
): ImportDecision {
  return { action, confidence: clampConfidence(confidence), reason, warnings, ...(targetEntityId && { targetEntityId }) };
}

/**
 * Construtor único de ImportDecision — nenhuma ImportStrategy deve montar o
 * objeto na mão. Centraliza o clamp de confidence e mantém a assinatura
 * (reason, confidence?, warnings?) consistente entre todas as strategies.
 */
export const ImportDecisionFactory = {
  create(reason: string, confidence = 1, warnings: ImportWarning[] = []): ImportDecision {
    return build("CREATE", reason, confidence, warnings);
  },
  /** `targetEntityId` é obrigatório: um Writer nunca deve aplicar UPDATE sem saber em qual registro. */
  update(targetEntityId: string, reason: string, confidence = 1, warnings: ImportWarning[] = []): ImportDecision {
    return build("UPDATE", reason, confidence, warnings, targetEntityId);
  },
  /** `targetEntityId` é obrigatório pelo mesmo motivo de `update`. */
  merge(targetEntityId: string, reason: string, confidence = 1, warnings: ImportWarning[] = []): ImportDecision {
    return build("MERGE", reason, confidence, warnings, targetEntityId);
  },
  ignore(reason: string, confidence = 1, warnings: ImportWarning[] = []): ImportDecision {
    return build("IGNORE", reason, confidence, warnings);
  },
  manualReview(reason: string, confidence = 0, warnings: ImportWarning[] = []): ImportDecision {
    return build("MANUAL_REVIEW", reason, confidence, warnings);
  },
};
