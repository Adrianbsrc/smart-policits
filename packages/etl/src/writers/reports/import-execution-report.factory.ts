import type { WriteOutcome } from "../write-outcome.model";
import type { ImportExecutionReport } from "./import-execution-report.model";

/** Agrega WriteOutcome[] de uma execução em um único ImportExecutionReport. */
export const ImportExecutionReportFactory = {
  build(outcomes: WriteOutcome[]): ImportExecutionReport {
    return {
      imported: outcomes.filter((o) => o.kind === "imported").length,
      updated: outcomes.filter((o) => o.kind === "updated").length,
      ignored: outcomes.filter((o) => o.kind === "ignored").length,
      manualReview: outcomes.filter((o) => o.kind === "manualReview").length,
      failed: outcomes.filter((o) => o.kind === "failed").length,
    };
  },
};
