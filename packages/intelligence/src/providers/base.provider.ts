import { createHash } from "crypto";

import type { InterpretationInput } from "../types/interpretation.types";

export abstract class BaseProvider {
  /**
   * Computa hash SHA-256 do input para deduplicação.
   * Retorna os primeiros 16 hex chars (64-bit) — suficiente para uniqueness prática.
   */
  protected computeHash(input: InterpretationInput): string {
    const stable = JSON.stringify({
      type: input.type,
      title: input.title.trim().toLowerCase(),
      description: input.description.trim().toLowerCase(),
    });
    return createHash("sha256").update(stable).digest("hex").slice(0, 16);
  }

  protected now(): string {
    return new Date().toISOString();
  }
}
