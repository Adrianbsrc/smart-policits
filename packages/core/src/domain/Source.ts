/**
 * Value Object — origem/fonte de uma informação exibida ao usuário.
 * Shared Kernel: compartilhado entre backend (NestJS `implements Source`)
 * e frontend (Models tipados diretamente como `Source`).
 *
 * Apenas estrutura — nenhuma regra de negócio implementada.
 */
export interface Source {
  name: string;
  url: string | null;
}
