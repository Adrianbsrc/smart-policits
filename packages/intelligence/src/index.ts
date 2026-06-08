// ── Interfaces ────────────────────────────────────────────────────────────────
export type { IntelligenceProvider } from "./interfaces/intelligence-provider.interface";

// ── Schemas Zod ───────────────────────────────────────────────────────────────
export {
  InterpretationInputSchema,
  InterpretationResultSchema,
  INPUT_TYPES,
  TOPIC_KEYS,
  IMPACT_DIRECTIONS,
  COMPLEXITIES,
} from "./schemas/interpretation.schema";

export {
  StoryInputSchema,
  StoryResultSchema,
  BACKGROUND_THEMES,
} from "./schemas/story.schema";

// ── Tipos TypeScript ───────────────────────────────────────────────────────────
export type {
  InterpretationInput,
  InterpretationResult,
  StoryInput,
  StoryResult,
  InputType,
  ImpactDirection,
  Complexity,
  TopicKey,
  BackgroundTheme,
  BillData,
  VoteData,
  DecreeData,
  NewsData,
  IntelligenceConfig,
} from "./types/interpretation.types";

// ── Providers ─────────────────────────────────────────────────────────────────
export { BaseProvider } from "./providers/base.provider";
export { MockProvider } from "./providers/mock.provider";
export { ManualProvider } from "./providers/manual.provider";
export { ClaudeProvider } from "./providers/claude.provider";
export { OpenAIProvider } from "./providers/openai.provider";

export type { ClaudeProviderConfig } from "./providers/claude.provider";
export type { OpenAIProviderConfig } from "./providers/openai.provider";

// ── Pipelines ─────────────────────────────────────────────────────────────────
export { InterpretBillPipeline } from "./pipelines/interpret-bill.pipeline";
export { ClassifyTopicPipeline } from "./pipelines/classify-topic.pipeline";
export { SummarizeProposalPipeline } from "./pipelines/summarize-proposal.pipeline";
export { GenerateStoryPipeline } from "./pipelines/generate-story.pipeline";
export { DetectRelevancePipeline } from "./pipelines/detect-relevance.pipeline";

export type { ClassificationResult } from "./pipelines/classify-topic.pipeline";
export type { SummaryResult } from "./pipelines/summarize-proposal.pipeline";
export type { RelevanceResult } from "./pipelines/detect-relevance.pipeline";

// ── Serviço central ───────────────────────────────────────────────────────────
export { IntelligenceService } from "./services/intelligence.service";
