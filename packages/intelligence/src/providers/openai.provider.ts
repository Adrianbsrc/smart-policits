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

export interface OpenAIProviderConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

/**
 * Provider OpenAI (GPT).
 * Requer openai instalado (optionalDependency).
 */
export class OpenAIProvider extends BaseProvider implements IntelligenceProvider {
  readonly id = "openai";
  readonly name = "OpenAI (GPT)";

  private readonly config: Required<OpenAIProviderConfig>;

  constructor(config: OpenAIProviderConfig) {
    super();
    this.config = {
      model: "gpt-4o-mini",
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

    const response = await client.chat.completions.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildInterpretSystemPrompt() },
        { role: "user", content: buildInterpretUserPrompt(input) },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(text) as Record<string, unknown>;

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

    const response = await client.chat.completions.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildStorySystemPrompt() },
        { role: "user", content: buildStoryUserPrompt(input) },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(text) as Record<string, unknown>;

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
      const { default: OpenAI } = require("openai") as {
        default: { new (config: { apiKey: string }): unknown };
      };
      return new OpenAI({ apiKey: this.config.apiKey }) as {
        chat: {
          completions: {
            create(params: {
              model: string;
              max_tokens: number;
              response_format: { type: string };
              messages: { role: string; content: string }[];
            }): Promise<{ choices: { message: { content: string | null } }[] }>;
          };
        };
      };
    } catch {
      throw new Error(
        "OpenAIProvider: openai não está instalado. " +
          "Instale via: pnpm add openai",
      );
    }
  }
}
