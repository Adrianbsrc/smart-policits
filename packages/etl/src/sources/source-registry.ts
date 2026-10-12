import type { SourceDefinition } from "./source.contract";

/**
 * Catálogo de Sources. Cada fonte é independente das demais — registrar,
 * consultar ou desativar uma Source nunca exige alterar outra
 * (docs/SPECs/sources.md#princípios).
 */
export interface SourceRegistry {
  register(source: SourceDefinition): void;
  get(sourceId: string): SourceDefinition;
  has(sourceId: string): boolean;
  list(): SourceDefinition[];
}

export class InMemorySourceRegistry implements SourceRegistry {
  private readonly sources = new Map<string, SourceDefinition>();

  register(source: SourceDefinition): void {
    if (this.sources.has(source.id)) {
      throw new Error(`Source "${source.id}" já está registrada.`);
    }
    this.sources.set(source.id, source);
  }

  get(sourceId: string): SourceDefinition {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Source "${sourceId}" não encontrada.`);
    }
    return source;
  }

  has(sourceId: string): boolean {
    return this.sources.has(sourceId);
  }

  list(): SourceDefinition[] {
    return Array.from(this.sources.values());
  }
}
