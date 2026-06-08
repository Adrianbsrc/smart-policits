import { InterpretationResultSchema } from "../schemas/interpretation.schema";
import { StoryResultSchema } from "../schemas/story.schema";
import type { IntelligenceProvider } from "../interfaces/intelligence-provider.interface";
import type {
  InterpretationInput,
  InterpretationResult,
  StoryResult,
  TopicKey,
} from "../types/interpretation.types";
import { BaseProvider } from "./base.provider";

const ALL_CATEGORIES = [
  "segurança pública",
  "saúde",
  "educação",
  "economia",
  "meio ambiente",
  "infraestrutura",
  "tecnologia",
  "agropecuária",
  "relações internacionais",
  "cultura",
  "direitos sociais",
  "empreendedorismo",
  "justiça",
  "tributação",
  "previdência",
  "habitação",
  "transporte",
  "energia",
  "trabalho",
  "defesa",
] as const;

const ALL_TOPICS: TopicKey[] = [
  "security",
  "health",
  "education",
  "economy",
  "environment",
  "infrastructure",
  "technology",
  "agriculture",
  "international",
  "culture",
  "socialRights",
  "entrepreneurship",
];

const COVERAGE_DIRECTIONS = ["expansivo", "restritivo", "neutro", "misto"] as const;
const COMPLEXITIES = ["baixa", "média", "alta"] as const;
const BACKGROUND_THEMES = ["policy_change", "alert", "achievement", "neutral"] as const;

/**
 * Provider mock determinístico — sem chamadas de API.
 * Usado em desenvolvimento, testes e como fallback final.
 * Resultados são reproduzíveis dado o mesmo input.
 */
export class MockProvider extends BaseProvider implements IntelligenceProvider {
  readonly id = "mock";
  readonly name = "Mock Provider";

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async interpret(input: InterpretationInput): Promise<InterpretationResult> {
    const hash = this.computeHash(input);
    const seed = this.hashToSeed(hash);

    const categoryCount = 2 + (seed % 2);
    const topicCount = 1 + (seed % 2);

    const categories = this.pick(ALL_CATEGORIES, categoryCount, seed).map(String);
    const topics = this.pick(ALL_TOPICS, topicCount, seed + 3);

    return InterpretationResultSchema.parse({
      categories,
      summary_simple: `[Mock] ${input.title.slice(0, 80)}. Interpretação simulada para desenvolvimento.`,
      possible_impacts: [
        "Impacto simulado sobre a sociedade",
        "Possível efeito regulatório no setor",
      ],
      coverage_direction: COVERAGE_DIRECTIONS[seed % 4],
      complexity: COMPLEXITIES[seed % 3],
      relevance_score: 30 + (seed % 55),
      topics,
      providerId: this.id,
      modelUsed: "mock-v1",
      interpretedAt: this.now(),
      inputHash: hash,
    });
  }

  async generateStory(input: InterpretationInput): Promise<StoryResult> {
    const hash = this.computeHash(input);
    const seed = this.hashToSeed(hash);

    return StoryResultSchema.parse({
      title: `[Mock] ${input.title.slice(0, 60)}`,
      short_summary: `Resumo simulado: ${input.description.slice(0, 100).trim()}.`,
      coverage_direction: COVERAGE_DIRECTIONS[seed % 4],
      main_profiles: [],
      cta: "Entender melhor",
      tags: ["mock", "desenvolvimento"],
      background_theme: BACKGROUND_THEMES[seed % 4],
      relevance_score: 30 + (seed % 55),
      providerId: this.id,
      interpretedAt: this.now(),
      inputHash: hash,
    });
  }

  private hashToSeed(hash: string): number {
    return hash
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  private pick<T>(arr: readonly T[], count: number, seed: number): T[] {
    const len = arr.length;
    const seen = new Set<number>();
    const result: T[] = [];

    for (let i = 0; result.length < count && i < len * 2; i++) {
      const idx = (seed + i * 7) % len;
      if (!seen.has(idx)) {
        seen.add(idx);
        const item = arr[idx];
        if (item !== undefined) result.push(item);
      }
    }

    return result;
  }
}
