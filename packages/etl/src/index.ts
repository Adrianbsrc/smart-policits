// ─── Câmara dos Deputados ─────────────────────────────────────────────────────
export * from "./sources/camara/camara";
export * from "./sources/camara/presenca";
export * from "./sources/camara/proposicoes";
export * from "./sources/camara/despesas";
export * from "./sources/camara/orgaos";

// ─── Senado Federal ───────────────────────────────────────────────────────────
export * from "./sources/senado/senado";
export * from "./sources/senado/votacoes";
export * from "./sources/senado/materias";

// ─── Normalização ─────────────────────────────────────────────────────────────
export * from "./normalize/camara";
export * from "./normalize/senado";

// ─── Score builders ───────────────────────────────────────────────────────────
export * from "./builders/score-input-builder";
export * from "./builders/event-builder";

// ─── Seeds ────────────────────────────────────────────────────────────────────
export * from "./seeds/politicians";
export * from "./seeds/score-inputs";

// ─── TSE ─────────────────────────────────────────────────────────────────────
export * from "./sources/tse";

// ─── Portal da Transparência ─────────────────────────────────────────────────
export * from "./sources/portal-transparencia";

// ─── CNJ Datajud ─────────────────────────────────────────────────────────────
export * from "./sources/cnj";
