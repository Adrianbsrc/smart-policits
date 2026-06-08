import { z } from "zod";

export const INPUT_TYPES = [
  "bill",
  "vote",
  "decree",
  "executive_action",
  "news",
  "spending",
] as const;

export const TOPIC_KEYS = [
  "education",
  "health",
  "security",
  "economy",
  "environment",
  "infrastructure",
  "technology",
  "agriculture",
  "international",
  "culture",
  "socialRights",
  "entrepreneurship",
] as const;

/**
 * Direção de mudança em cobertura/recursos de serviço público.
 *
 * IMPORTANTE: NÃO é julgamento de valor.
 * "expansivo" ≠ bom; "restritivo" ≠ ruim.
 * São apenas direções objetivas de mudança.
 *
 *   expansivo  = aumenta cobertura, recursos ou alcance de serviço/política
 *   restritivo = reduz cobertura, recursos ou alcance de serviço/política
 *   neutro     = sem alteração de cobertura ou impacto indeterminado
 *   misto      = expansivo em alguns aspectos e restritivo em outros
 */
export const COVERAGE_DIRECTIONS = ["expansivo", "restritivo", "neutro", "misto"] as const;

/** @deprecated Use COVERAGE_DIRECTIONS — mantido para compatibilidade durante migração */
export const IMPACT_DIRECTIONS = COVERAGE_DIRECTIONS;

export const COMPLEXITIES = ["baixa", "média", "alta"] as const;

export const InterpretationInputSchema = z.object({
  type: z.enum(INPUT_TYPES),
  title: z.string().min(3).max(500),
  description: z.string().min(10),
  date: z.string().optional(),
  /** slugs dos políticos envolvidos */
  politicians: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const InterpretationResultSchema = z.object({
  // ── Classificação semântica ────────────────────────────────────────
  categories: z.array(z.string()).min(1),
  summary_simple: z.string().min(10).max(500),
  possible_impacts: z.array(z.string()).min(1),
  /**
   * Direção de mudança em cobertura/recursos (sem julgamento de valor).
   * Substituiu `impact_direction` (que tinha conotação ideológica).
   */
  coverage_direction: z.enum(COVERAGE_DIRECTIONS),
  complexity: z.enum(COMPLEXITIES),
  relevance_score: z.number().int().min(0).max(100),
  /** Mapeado às dimensões da score engine — NÃO é score */
  topics: z.array(z.enum(TOPIC_KEYS)).min(0),

  // ── Metadados de auditoria ────────────────────────────────────────
  providerId: z.string(),
  modelUsed: z.string().optional(),
  interpretedAt: z.string().datetime(),
  /** SHA-256 truncado do input — usado para deduplicação no banco */
  inputHash: z.string().length(16),
});
