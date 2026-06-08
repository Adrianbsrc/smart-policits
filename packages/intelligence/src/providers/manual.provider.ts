import { InterpretationResultSchema } from "../schemas/interpretation.schema";
import type { IntelligenceProvider } from "../interfaces/intelligence-provider.interface";
import type {
  InterpretationInput,
  InterpretationResult,
  StoryResult,
} from "../types/interpretation.types";
import { BaseProvider } from "./base.provider";
import { MockProvider } from "./mock.provider";

/**
 * Provider manual — permite que administradores injetem interpretações
 * pré-escritas por humanos, sobrescrevendo qualquer provider de IA.
 *
 * Útil para: overrides editoriais, correções de interpretação, conteúdo sensível.
 */
export class ManualProvider extends BaseProvider implements IntelligenceProvider {
  readonly id = "manual";
  readonly name = "Manual Provider";

  private readonly store: Map<string, InterpretationResult>;
  private readonly fallback: MockProvider;

  constructor(preloaded: InterpretationResult[] = []) {
    super();
    this.fallback = new MockProvider();
    this.store = new Map(preloaded.map((r) => [r.inputHash, r]));
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async interpret(input: InterpretationInput): Promise<InterpretationResult> {
    const hash = this.computeHash(input);
    const stored = this.store.get(hash);

    if (stored) {
      return InterpretationResultSchema.parse({ ...stored, providerId: this.id });
    }

    return this.fallback.interpret(input);
  }

  async generateStory(input: InterpretationInput): Promise<StoryResult> {
    return this.fallback.generateStory(input);
  }

  /** Registra uma interpretação manual em runtime */
  register(result: InterpretationResult): void {
    this.store.set(result.inputHash, result);
  }

  /** Remove uma interpretação manual */
  unregister(inputHash: string): void {
    this.store.delete(inputHash);
  }
}
