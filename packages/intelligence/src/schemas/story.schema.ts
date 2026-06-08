import { z } from "zod";

import { COVERAGE_DIRECTIONS, InterpretationInputSchema } from "./interpretation.schema";

/**
 * Temas visuais para cards de feed — baseados no TIPO de evento, não em valor político.
 *
 *   policy_change = alteração de política pública
 *   alert         = investigação, irregularidade ou situação de atenção documentada
 *   achievement   = conclusão documentada (obra entregue, meta atingida, aprovação final)
 *   neutral       = evento informativo sem categorização clara
 */
export const BACKGROUND_THEMES = ["policy_change", "alert", "achievement", "neutral"] as const;

/** Story usa o mesmo formato de entrada que a interpretação */
export const StoryInputSchema = InterpretationInputSchema;

export const StoryResultSchema = z.object({
  title: z.string().min(3).max(80),
  short_summary: z.string().min(10).max(200),
  /** Direção de mudança em cobertura/recursos (sem julgamento de valor). */
  coverage_direction: z.enum(COVERAGE_DIRECTIONS),
  main_profiles: z.array(
    z.object({
      name: z.string(),
      slug: z.string().optional(),
      office: z.string().optional(),
    }),
  ),
  cta: z.string().min(3).max(50),
  cta_url: z.string().optional(),
  tags: z.array(z.string()),
  background_theme: z.enum(BACKGROUND_THEMES),
  relevance_score: z.number().int().min(0).max(100),

  // ── Metadados de auditoria ────────────────────────────────────────
  providerId: z.string(),
  interpretedAt: z.string().datetime(),
  inputHash: z.string().length(16),
});
