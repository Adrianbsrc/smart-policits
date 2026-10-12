import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type { TseBem, TseBensResponse, TseCandidato, TseCandidatosResponse } from "../../sources/tse/tse.types";
import type { TseBensQuery, TseCandidatosQuery, TseDataSource } from "./tse-data-source";

/** `packages/etl/fixtures/tse` — 3 níveis acima deste arquivo, tanto rodando de `src/` (tsx) quanto de `dist/` (build). */
const DEFAULT_FIXTURES_DIR = resolve(__dirname, "../../../fixtures/tse");

/**
 * Implementação de `TseDataSource` que lê fixtures estáticos em vez de
 * chamar a API real (docs/SPECs/etl.md — esta task não conecta ao TSE real).
 * Mesma forma de resposta da API (`TseCandidatosResponse`/`TseBensResponse`),
 * então trocar por `TseHttpDataSource` no futuro não exige nenhuma mudança
 * no `TseCollector`.
 */
export class TseFixtureDataSource implements TseDataSource {
  constructor(private readonly fixturesDir: string = DEFAULT_FIXTURES_DIR) {}

  async listCandidatos(query: TseCandidatosQuery): Promise<TseCandidato[]> {
    const data = await this.readFixture<TseCandidatosResponse>(this.candidatosFileName(query));
    return data.candidatos ?? [];
  }

  async listBens(query: TseBensQuery): Promise<TseBem[]> {
    const data = await this.readFixture<TseBensResponse>(this.bensFileName(query));
    return data.lista ?? [];
  }

  private candidatosFileName(query: TseCandidatosQuery): string {
    return `candidatos-${query.ano}-${query.uf.toUpperCase()}-${query.codigoCargo}.json`;
  }

  private bensFileName(query: TseBensQuery): string {
    return `bens-${query.ano}-${query.uf.toUpperCase()}-${query.codigoCargo}-${query.sqcand}.json`;
  }

  private async readFixture<T>(fileName: string): Promise<T> {
    const filePath = join(this.fixturesDir, fileName);
    let raw: string;
    try {
      raw = await readFile(filePath, "utf-8");
    } catch (cause) {
      throw new Error(`Fixture TSE não encontrado: ${filePath}`, { cause });
    }
    return JSON.parse(raw) as T;
  }
}
