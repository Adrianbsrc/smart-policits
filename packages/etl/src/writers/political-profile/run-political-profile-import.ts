import type { JobContext } from "../../contracts/job.contract";
import type { PoliticalProfileCandidate } from "../../domain/political-profile-candidate";
import type { ImportDecision } from "../../import-engine/contracts/import-decision.contract";
import { ImportExecutionReportFactory } from "../reports/import-execution-report.factory";
import type { ImportExecutionReport } from "../reports/import-execution-report.model";
import type { WriteOutcome } from "../write-outcome.model";
import type { PoliticalProfileWriter } from "./political-profile-writer.contract";

export interface PoliticalProfileImportItem {
  candidate: PoliticalProfileCandidate;
  decision: ImportDecision;
}

/**
 * Executa PoliticalProfileWriter sobre um lote de (candidato, decisão) e
 * agrega os resultados em um ImportExecutionReport — o fluxo completo até o
 * banco, do lado de fora do Writer (que só sabe escrever um item por vez).
 */
export async function runPoliticalProfileImport(
  items: PoliticalProfileImportItem[],
  writer: PoliticalProfileWriter,
  context: JobContext,
): Promise<ImportExecutionReport> {
  const outcomes: WriteOutcome[] = [];

  for (const { candidate, decision } of items) {
    outcomes.push(await writer.write(candidate, decision, context));
  }

  return ImportExecutionReportFactory.build(outcomes);
}
