export interface OfficialSource {
  name: string;
  description: string;
}

/**
 * Fontes oficiais curadas exibidas em "Por que confiar" — conteúdo estático,
 * não uma contagem dinâmica (ver docs/SPECs/home.md#estratégia-de-métricas-dinâmicas).
 * Fonte única: `officialSources` do Hero deriva o total a partir deste array.
 */
export const OFFICIAL_SOURCES: OfficialSource[] = [
  { name: "TSE", description: "Tribunal Superior Eleitoral" },
  { name: "Câmara", description: "Câmara dos Deputados" },
  { name: "Senado", description: "Senado Federal" },
  { name: "CGU", description: "Controladoria-Geral da União" },
];
