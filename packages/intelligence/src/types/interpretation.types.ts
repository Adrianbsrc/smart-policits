import type { z } from "zod";

import type {
  InterpretationInputSchema,
  InterpretationResultSchema,
  TOPIC_KEYS,
} from "../schemas/interpretation.schema";
import type { StoryInputSchema, StoryResultSchema } from "../schemas/story.schema";

export type InterpretationInput = z.infer<typeof InterpretationInputSchema>;
export type InterpretationResult = z.infer<typeof InterpretationResultSchema>;
export type StoryInput = z.infer<typeof StoryInputSchema>;
export type StoryResult = z.infer<typeof StoryResultSchema>;

export type InputType = InterpretationInput["type"];
/** Direção de mudança em cobertura/recursos — sem julgamento de valor. */
export type CoverageDirection = InterpretationResult["coverage_direction"];
/** @deprecated Use CoverageDirection */
export type ImpactDirection = CoverageDirection;
export type Complexity = InterpretationResult["complexity"];
export type TopicKey = (typeof TOPIC_KEYS)[number];
export type BackgroundTheme = StoryResult["background_theme"];

/** Dados de entrada para interpretação de projeto de lei */
export interface BillData {
  title: string;
  description: string;
  date?: string;
  authors?: string[];
  number?: string;
  status?: string;
}

/** Dados de entrada para interpretação de votação */
export interface VoteData {
  description: string;
  date?: string;
  organ?: string;
  politicians?: string[];
}

/** Dados de entrada para interpretação de decreto ou ação executiva */
export interface DecreeData {
  title: string;
  description: string;
  date?: string;
  issuer?: string;
  number?: string;
}

/** Dados de entrada para interpretação de notícia/pauta */
export interface NewsData {
  title: string;
  description: string;
  date?: string;
  politicians?: string[];
  source?: string;
}

export interface IntelligenceConfig {
  primaryProvider: string;
  fallbackProvider: string;
}
