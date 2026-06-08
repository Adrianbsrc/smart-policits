import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "../../config/prisma.service";

export interface InterpretationListItem {
  id: string;
  inputHash: string;
  inputType: string;
  providerId: string;
  modelUsed: string | null;
  schemaVersion: string;
  createdAt: Date;
  result: unknown;
}

import {
  ClaudeProvider,
  IntelligenceService as CoreIntelligenceService,
  MockProvider,
  OpenAIProvider,
  type IntelligenceProvider,
  type InterpretationInput,
  type InterpretationResult,
  type StoryResult,
} from "@smart-politics/intelligence";

@Injectable()
export class IntelligenceService implements OnModuleInit {
  private readonly logger = new Logger(IntelligenceService.name);
  private core!: CoreIntelligenceService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const providers = this.buildProviders();
    const primary = this.config.get<string>("INTELLIGENCE_PRIMARY_PROVIDER", "mock");

    this.core = new CoreIntelligenceService(providers, {
      primaryProvider: primary,
      fallbackProvider: "mock",
    });

    this.logger.log(`IntelligenceService iniciado — provider primário: ${primary}`);
  }

  async interpret(input: InterpretationInput): Promise<InterpretationResult> {
    const result = await this.core.interpret(input);
    await this.save(input, result);
    return result;
  }

  async generateStory(input: InterpretationInput): Promise<StoryResult> {
    return this.core.generateStory(input);
  }

  async listInterpretations(
    inputType?: string,
    skip = 0,
    take = 20,
  ): Promise<InterpretationListItem[]> {
    return this.prisma.interpretation.findMany({
      where: inputType ? { inputType } : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        inputHash: true,
        inputType: true,
        providerId: true,
        modelUsed: true,
        schemaVersion: true,
        createdAt: true,
        result: true,
      },
      skip,
      take,
    });
  }

  private buildProviders(): IntelligenceProvider[] {
    const providers: IntelligenceProvider[] = [new MockProvider()];

    const anthropicKey = this.config.get<string>("ANTHROPIC_API_KEY");
    if (anthropicKey) {
      providers.push(new ClaudeProvider({ apiKey: anthropicKey }));
      this.logger.log("ClaudeProvider registrado");
    }

    const openaiKey = this.config.get<string>("OPENAI_API_KEY");
    if (openaiKey) {
      providers.push(new OpenAIProvider({ apiKey: openaiKey }));
      this.logger.log("OpenAIProvider registrado");
    }

    return providers;
  }

  private async save(
    input: InterpretationInput,
    result: InterpretationResult,
  ): Promise<void> {
    try {
      await this.prisma.interpretation.upsert({
        where: { inputHash: result.inputHash },
        create: {
          inputHash: result.inputHash,
          inputType: input.type,
          inputData: input as object,
          result: result as object,
          providerId: result.providerId,
          modelUsed: result.modelUsed,
        },
        update: {
          result: result as object,
          providerId: result.providerId,
          modelUsed: result.modelUsed,
        },
      });
    } catch (err) {
      this.logger.warn(`Falha ao salvar interpretação: ${String(err)}`);
    }
  }
}
