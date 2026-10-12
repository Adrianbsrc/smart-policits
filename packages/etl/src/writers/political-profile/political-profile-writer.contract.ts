import type { JobContext } from "../../contracts/job.contract";
import type { PoliticalProfileCandidate } from "../../domain/political-profile-candidate";
import type { ImportDecision } from "../../import-engine/contracts/import-decision.contract";
import type { WriteOutcome } from "../write-outcome.model";

/**
 * Persiste um PoliticalProfileCandidate — mas apenas o que a ImportDecision
 * autoriza (docs/SPECs/etl.md#5-persist). Nunca decide o que fazer (isso é
 * do Import Engine); nunca grava fora da ação pedida por `decision.action`.
 */
export interface PoliticalProfileWriter {
  write(candidate: PoliticalProfileCandidate, decision: ImportDecision, context: JobContext): Promise<WriteOutcome>;
}
