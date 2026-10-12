import type { Collector, CollectorMetadata } from "../contracts/collector.contract";

/**
 * Permite registrar e resolver Collectors por id sem que o pipeline (ver
 * etl-pipeline.ts) precise conhecer as fontes concretas — adicionar uma nova
 * fonte é registrar um novo Collector, nunca alterar o pipeline.
 */
export interface CollectorRegistry {
  register<TRaw, TParams>(collector: Collector<TRaw, TParams>): void;
  get<TRaw = unknown, TParams = void>(collectorId: string): Collector<TRaw, TParams>;
  has(collectorId: string): boolean;
  list(): CollectorMetadata[];
}

export class InMemoryCollectorRegistry implements CollectorRegistry {
  // Guardado como Collector<unknown, unknown>: o registry é heterogêneo por natureza
  // (dezenas de fontes, cada uma com seu próprio TRaw/TParams). O cast em get() devolve
  // ao chamador o tipo que ele já sabe pedir, como um DI container faria.
  private readonly collectors = new Map<string, Collector<unknown, unknown>>();

  register<TRaw, TParams>(collector: Collector<TRaw, TParams>): void {
    if (this.collectors.has(collector.metadata.id)) {
      throw new Error(`Collector "${collector.metadata.id}" já está registrado.`);
    }
    this.collectors.set(collector.metadata.id, collector as unknown as Collector<unknown, unknown>);
  }

  get<TRaw = unknown, TParams = void>(collectorId: string): Collector<TRaw, TParams> {
    const collector = this.collectors.get(collectorId);
    if (!collector) {
      throw new Error(`Collector "${collectorId}" não encontrado.`);
    }
    return collector as unknown as Collector<TRaw, TParams>;
  }

  has(collectorId: string): boolean {
    return this.collectors.has(collectorId);
  }

  list(): CollectorMetadata[] {
    return Array.from(this.collectors.values()).map((collector) => collector.metadata);
  }
}
