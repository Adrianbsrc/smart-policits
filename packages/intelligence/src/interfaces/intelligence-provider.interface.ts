import type { InterpretationInput, InterpretationResult, StoryResult } from "../types/interpretation.types";

export interface IntelligenceProvider {
  readonly id: string;
  readonly name: string;

  /**
   * Interpreta semanticamente um evento político.
   * Nunca gera score — apenas categoriza, resume e detecta impactos.
   */
  interpret(input: InterpretationInput): Promise<InterpretationResult>;

  /**
   * Gera conteúdo estruturado de story/short para o feed.
   */
  generateStory(input: InterpretationInput): Promise<StoryResult>;

  /**
   * Verifica se o provider está disponível (chave de API configurada, serviço online).
   */
  isAvailable(): Promise<boolean>;
}
