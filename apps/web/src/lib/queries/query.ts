/**
 * Contrato compartilhado de Query Object. Um Query Object encapsula um caso
 * de uso de leitura completo (api → dto → mapper → domain model →
 * view-model mapper → view model), devolvendo diretamente o que o
 * componente/hook consome. Hooks (`use-*.ts`) só chamam `execute()` — nunca
 * reimplementam a orquestração.
 */
export interface Query<TParams, TResult> {
  execute(params: TParams): Promise<TResult>;
}
