import type { Source } from "@smart-politics/core";
import type { EvidenceReliability } from "./evidence-reliability.enum";
import type { EvidenceSourceType } from "./evidence-source-type.enum";

/**
 * Estende o VO compartilhado `Source` ({name, url}) em vez de redeclarar seus
 * campos — nunca duplicar o Shared Kernel (ver CLAUDE.md#shared-kernel).
 * Uma Evidence pode ter múltiplas EvidenceSource (ver `Evidence.sources`).
 */
export interface EvidenceSource extends Source {
  organization: string;
  type: EvidenceSourceType;
  reliability: EvidenceReliability;
  collectedAt: Date;
  /** Hash/checksum do documento fonte, quando disponível — docs/SPECs/evidence.md#fonte. */
  checksum: string | null;
}
