import type { IntelligenceProvider } from "../interfaces/intelligence-provider.interface";
import type { BillData, InterpretationResult } from "../types/interpretation.types";

/**
 * Pipeline de interpretação de Projetos de Lei.
 * Converte dados estruturados de PL em InterpretationResult validado.
 */
export class InterpretBillPipeline {
  constructor(private readonly provider: IntelligenceProvider) {}

  async run(bill: BillData): Promise<InterpretationResult> {
    return this.provider.interpret({
      type: "bill",
      title: bill.title,
      description: bill.description,
      date: bill.date,
      politicians: bill.authors,
      metadata: {
        number: bill.number,
        status: bill.status,
      },
    });
  }
}
