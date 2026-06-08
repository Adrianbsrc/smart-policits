import { InterpretationResultSchema } from "../schemas/interpretation.schema";
import { StoryResultSchema } from "../schemas/story.schema";
import type { IntelligenceProvider } from "../interfaces/intelligence-provider.interface";
import type {
  InterpretationInput,
  InterpretationResult,
  StoryResult,
} from "../types/interpretation.types";
import { buildInterpretSystemPrompt, buildInterpretUserPrompt } from "../prompts/interpret.prompt";
import { buildStorySystemPrompt, buildStoryUserPrompt } from "../prompts/story.prompt";
import { BaseProvider } from "./base.provider";

export interface ClaudeProviderConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

/**
 * Provider Claude (Anthropic).
 * Requer @anthropic-ai/sdk instalado (optionalDependency).
 */
export class ClaudeProvider extends BaseProvider implements IntelligenceProvider {
  readonly id = "claude";
  readonly name = "Claude (Anthropic)";

  private readonly config: Required<ClaudeProviderConfig>;

  constructor(config: ClaudeProviderConfig) {
    super();
    this.config = {
      model: "claude-haiku-4-5-20251001",
      maxTokens: 1024,
      ...config,
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.getClient();
      return true;
    } catch {
      return false;
    }
  }

  async interpret(input: InterpretationInput): Promise<InterpretationResult> {
    const client = await this.getClient();
    const hash = this.computeHash(input);

    const response = await client.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      system: buildInterpretSystemPrompt(),
      messages: [{ role: "user", content: buildInterpretUserPrompt(input) }],
    });

    const text = this.extractText(response.content);
    const parsed = this.parseJson(text);

    return InterpretationResultSchema.parse({
      ...parsed,
      providerId: this.id,
      modelUsed: this.config.model,
      interpretedAt: this.now(),
      inputHash: hash,
    });
  }

  async generateStory(input: InterpretationInput): Promise<StoryResult> {
    const client = await this.getClient();
    const hash = this.computeHash(input);

    const response = await client.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      system: buildStorySystemPrompt(),
      messages: [{ role: "user", content: buildStoryUserPrompt(input) }],
    });

    const text = this.extractText(response.content);
    const parsed = this.parseJson(text);

    return StoryResultSchema.parse({
      ...parsed,
      providerId: this.id,
      interpretedAt: this.now(),
      inputHash: hash,
    });
  }

  private async getClient() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: Anthropic } = require("@anthropic-ai/sdk") as {
        default: { new (config: { apiKey: string }): unknown };
      };
      return new Anthropic({ apiKey: this.config.apiKey }) as {
        messages: {
          create(params: {
            model: string;
            max_tokens: number;
            system: string;
            messages: { role: string; content: string }[];
          }): Promise<{ content: { type: string; text?: string }[] }>;
        };
      };
    } catch {
      throw new Error(
        "ClaudeProvider: @anthropic-ai/sdk não está instalado. " +
          "Instale via: pnpm add @anthropic-ai/sdk",
      );
    }
  }

  private extractText(content: { type: string; text?: string }[]): string {
    const block = content.find((b) => b.type === "text");
    if (!block?.text) throw new Error("ClaudeProvider: resposta vazia ou sem bloco de texto");
    return block.text.trim();
  }

  private parseJson(text: string): Record<string, unknown> {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch?.[0]) {
      throw new Error(`ClaudeProvider: resposta não contém JSON válido — "${text.slice(0, 100)}"`);
    }
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  }
}
