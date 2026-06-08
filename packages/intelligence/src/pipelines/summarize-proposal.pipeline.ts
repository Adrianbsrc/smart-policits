import type { IntelligenceProvider } from "../interfaces/intelligence-provider.interface";

export interface SummaryResult {
  summary_simple: string;
  complexity: string;
}

/**
 * Pipeline de simplificação de linguagem jurídica/legislativa.
 * Converte texto técnico em linguagem acessível ao cidadão.
 */
export class SummarizeProposalPipeline {
  constructor(private readonly provider: IntelligenceProvider) {}

  async run(title: string, legalText: string): Promise<SummaryResult> {
    const result = await this.provider.interpret({
      type: "bill",
      title,
      description: legalText,
    });

    return {
      summary_simple: result.summary_simple,
      complexity: result.complexity,
    };
  }
}
