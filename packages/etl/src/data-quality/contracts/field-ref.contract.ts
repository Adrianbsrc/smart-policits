/**
 * Extrai um valor de T para uma regra genérica avaliar. Nenhuma regra
 * hardcoda o nome de um campo — quem instancia a regra (o dono do domínio
 * ou da fonte) decide, via `get()`, qual campo está sendo checado.
 */
export interface FieldRef<T, TValue = unknown> {
  /** Rótulo usado nas mensagens de erro/aviso — não precisa ser o nome real da propriedade. */
  label: string;
  get(value: T): TValue;
}

export interface ArrayFieldRef<T, TItem = unknown> extends FieldRef<T, TItem[]> {
  /** Chave de comparação para detectar duplicatas — por padrão, JSON.stringify(item). */
  keyOf?(item: TItem): string;
}
