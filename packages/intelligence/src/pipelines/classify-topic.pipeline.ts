import type { IntelligenceProvider } from "../interfaces/intelligence-provider.interface";
import type { TopicKey } from "../types/interpretation.types";

export interface ClassificationResult {
  categories: string[];
  topics: TopicKey[];
}

/**
 * Pipeline de classificação temática.
 * Extrai apenas categorias e topics de um texto político.
 */
export class ClassifyTopicPipeline {
  constructor(private readonly provider: IntelligenceProvider) {}

  async run(title: string, description: string): Promise<ClassificationResult> {
    const result = await this.provider.interpret({
      type: "news",
      title,
      description,
    });

    return {
      categories: result.categories,
      topics: result.topics,
    };
  }
}
