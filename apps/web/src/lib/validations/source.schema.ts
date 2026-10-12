import { z } from "zod";

/**
 * Schema Zod runtime do Value Object compartilhado `Source`
 * (@smart-politics/core). O Shared Kernel é framework-agnóstico (sem Zod),
 * então o schema de validação em runtime vive aqui — reaproveitado por
 * qualquer feature que precise citar a origem de um dado (timeline,
 * promises, ...) para nunca duplicar esta forma em cada feature.
 */
export const sourceDtoSchema = z.object({
  name: z.string(),
  url: z.string().nullable(),
});

export type SourceDto = z.infer<typeof sourceDtoSchema>;
