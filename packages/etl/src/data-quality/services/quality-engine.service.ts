import type { JobContext } from "../../contracts/job.contract";
import { QualityReportFactory } from "../reports/quality-report.factory";
import type { QualityReport } from "../reports/quality-report.model";
import type { QualityRuleRegistry } from "./quality-rule-registry";

/**
 * Ponto único de entrada do Data Quality Engine (docs/SPECs/etl.md). Roda
 * todas as regras registradas contra um objeto normalizado e devolve um
 * QualityReport — nunca decide o que fazer com o dado. Quem decide é o
 * Import Engine (../../import-engine/), e só deve receber objetos cujo
 * QualityReport tem `approved: true`.
 */
export class QualityEngine<T> {
  constructor(private readonly rules: QualityRuleRegistry<T>) {}

  async evaluate(value: T, context: JobContext): Promise<QualityReport> {
    const results = await Promise.all(this.rules.list().map((rule) => rule.evaluate(value, context)));
    return QualityReportFactory.build(results);
  }
}
