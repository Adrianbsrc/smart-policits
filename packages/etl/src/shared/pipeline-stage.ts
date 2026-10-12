/** Etapas do pipeline ETL, na ordem em que são executadas. */
export type PipelineStage = "collect" | "normalize" | "validate" | "enrich" | "write";
