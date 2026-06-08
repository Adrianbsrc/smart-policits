import type { IntelligenceProvider } from "../interfaces/intelligence-provider.interface";
import type {
  BillData,
  DecreeData,
  IntelligenceConfig,
  InterpretationInput,
  InterpretationResult,
  NewsData,
  StoryResult,
  VoteData,
} from "../types/interpretation.types";
import { InterpretBillPipeline } from "../pipelines/interpret-bill.pipeline";
import { GenerateStoryPipeline } from "../pipelines/generate-story.pipeline";
import { DetectRelevancePipeline } from "../pipelines/detect-relevance.pipeline";
import { ClassifyTopicPipeline } from "../pipelines/classify-topic.pipeline";
import { SummarizeProposalPipeline } from "../pipelines/summarize-proposal.pipeline";

/**
 * Serviço central de inteligência política.
 *
 * PRINCÍPIOS:
 * - Nunca gera score político — apenas interpreta, classifica e resume.
 * - Nunca emite opinião ou julgamento ideológico.
 * - Decisions finais (score, ranking) permanecem na score engine matemática.
 *
 * Fallback chain: primary → fallback → mock (nunca falha)
 */
export class IntelligenceService {
  private readonly providerMap: Map<string, IntelligenceProvider>;
  private readonly config: IntelligenceConfig;

  constructor(providers: IntelligenceProvider[], config: IntelligenceConfig) {
    this.providerMap = new Map(providers.map((p) => [p.id, p]));
    this.config = config;
  }

  // ── Métodos de alto nível ──────────────────────────────────────────

  async interpret(input: InterpretationInput): Promise<InterpretationResult> {
    return this.withFallback((p) => p.interpret(input));
  }

  async generateStory(input: InterpretationInput): Promise<StoryResult> {
    return this.withFallback((p) => p.generateStory(input));
  }

  // ── Helpers de domínio ─────────────────────────────────────────────

  async interpretBill(data: BillData): Promise<InterpretationResult> {
    const provider = this.getPrimary();
    return new InterpretBillPipeline(provider).run(data);
  }

  async interpretVote(data: VoteData): Promise<InterpretationResult> {
    return this.interpret({
      type: "vote",
      title: data.description.slice(0, 200),
      description: data.organ
        ? `Votação em ${data.organ}: ${data.description}`
        : data.description,
      date: data.date,
      politicians: data.politicians,
    });
  }

  async interpretDecree(data: DecreeData): Promise<InterpretationResult> {
    return this.interpret({
      type: "decree",
      title: data.title,
      description: data.description,
      date: data.date,
      politicians: data.issuer ? [data.issuer] : undefined,
      metadata: { number: data.number },
    });
  }

  async interpretNews(data: NewsData): Promise<InterpretationResult> {
    return this.interpret({
      type: "news",
      title: data.title,
      description: data.description,
      date: data.date,
      politicians: data.politicians,
      metadata: { source: data.source },
    });
  }

  async classifyTopics(title: string, description: string) {
    const provider = this.getPrimary();
    return new ClassifyTopicPipeline(provider).run(title, description);
  }

  async summarizeProposal(title: string, legalText: string) {
    const provider = this.getPrimary();
    return new SummarizeProposalPipeline(provider).run(title, legalText);
  }

  async detectRelevance(input: InterpretationInput) {
    const provider = this.getPrimary();
    return new DetectRelevancePipeline(provider).run(input);
  }

  async generateStoryFromBill(bill: BillData): Promise<StoryResult> {
    return this.generateStory({
      type: "bill",
      title: bill.title,
      description: bill.description,
      politicians: bill.authors,
    });
  }

  // ── Infraestrutura ─────────────────────────────────────────────────

  private async withFallback<T>(fn: (provider: IntelligenceProvider) => Promise<T>): Promise<T> {
    const primary = this.providerMap.get(this.config.primaryProvider);
    const fallback = this.providerMap.get(this.config.fallbackProvider);
    const mock = this.providerMap.get("mock");

    const candidates = [primary, fallback, mock].filter(
      (p): p is IntelligenceProvider => p !== undefined,
    );

    const errors: Error[] = [];
    for (const provider of candidates) {
      try {
        return await fn(provider);
      } catch (err) {
        errors.push(err instanceof Error ? err : new Error(String(err)));
      }
    }

    throw new Error(
      `IntelligenceService: todos os providers falharam.\n${errors.map((e) => e.message).join("\n")}`,
    );
  }

  private getPrimary(): IntelligenceProvider {
    const provider =
      this.providerMap.get(this.config.primaryProvider) ??
      this.providerMap.get(this.config.fallbackProvider) ??
      this.providerMap.get("mock");

    if (!provider) throw new Error("IntelligenceService: nenhum provider disponível");
    return provider;
  }
}
