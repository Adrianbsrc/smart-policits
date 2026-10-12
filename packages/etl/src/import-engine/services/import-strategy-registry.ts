import type { ImportStrategy } from "../contracts/import-strategy.contract";

/**
 * Permite registrar e resolver ImportStrategy por `type` sem que
 * `ImportEngine` precise conhecer as strategies concretas — adicionar um
 * novo tipo de candidato é registrar uma nova strategy, nunca alterar
 * `ImportEngine` (Open/Closed). Mesmo padrão de `CollectorRegistry`
 * (ver ../../jobs/collector-registry.ts).
 */
export interface ImportStrategyRegistry {
  register<T>(strategy: ImportStrategy<T>): void;
  get<T>(type: string): ImportStrategy<T>;
  has(type: string): boolean;
  list(): string[];
}

export class InMemoryImportStrategyRegistry implements ImportStrategyRegistry {
  // Guardado como ImportStrategy<unknown>: o registry é heterogêneo por natureza
  // (dezenas de tipos de candidato, cada um com seu próprio T). O cast em get()
  // devolve ao chamador o tipo que ele já sabe pedir, como um DI container faria
  // (mesma justificativa de InMemoryCollectorRegistry).
  private readonly strategies = new Map<string, ImportStrategy<unknown>>();

  register<T>(strategy: ImportStrategy<T>): void {
    if (this.strategies.has(strategy.type)) {
      throw new Error(`ImportStrategy para o tipo "${strategy.type}" já está registrada.`);
    }
    this.strategies.set(strategy.type, strategy as unknown as ImportStrategy<unknown>);
  }

  get<T>(type: string): ImportStrategy<T> {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Nenhuma ImportStrategy registrada para o tipo "${type}".`);
    }
    return strategy as unknown as ImportStrategy<T>;
  }

  has(type: string): boolean {
    return this.strategies.has(type);
  }

  list(): string[] {
    return Array.from(this.strategies.keys());
  }
}
