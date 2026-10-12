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

// ─── Arquitetura ETL (contratos, pipeline, registries) ─────────────────────────
export * from "./contracts";
export * from "./shared";
export * from "./jobs";
export * from "./sources/source.contract";
export * from "./sources/source-registry";
export * from "./domain";

// ─── Collector/Normalizer TSE (primeira fonte real) ─────────────────────────────
export * from "./collectors/tse";
export * from "./normalizers/tse";

// ─── Import Engine (decide como candidatos normalizados entram na plataforma) ──
export * from "./import-engine";

// ─── Data Quality Engine (valida qualidade antes do Import Engine) ─────────────
export * from "./data-quality";

// ─── Writers (primeira persistência real do ETL) ────────────────────────────────
export * from "./writers";
