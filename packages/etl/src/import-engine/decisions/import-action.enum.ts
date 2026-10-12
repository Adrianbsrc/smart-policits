/**
 * Ações possíveis que o Import Engine pode decidir para um ImportCandidate.
 * Nenhuma delas é executada aqui — apenas decidida. Quem executa (grava no
 * banco) é uma etapa futura (Writer/backoffice), fora do escopo desta task.
 */
export const IMPORT_ACTIONS = ["CREATE", "UPDATE", "MERGE", "IGNORE", "MANUAL_REVIEW"] as const;

export type ImportAction = (typeof IMPORT_ACTIONS)[number];
