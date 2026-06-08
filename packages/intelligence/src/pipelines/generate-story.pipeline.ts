import type { IntelligenceProvider } from "../interfaces/intelligence-provider.interface";
import type { InterpretationInput, StoryResult } from "../types/interpretation.types";

/**
 * Pipeline de geração de story/short para o feed.
 * Produz conteúdo estruturado para cards mobile/swipe.
 */
export class GenerateStoryPipeline {
  constructor(private readonly provider: IntelligenceProvider) {}

  async run(input: InterpretationInput): Promise<StoryResult> {
    return this.provider.generateStory(input);
  }
}
