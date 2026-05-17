export const OFFICES = {
  president: { label: "Presidente", abbr: "PR", hasState: false },
  governor: { label: "Governador", abbr: "GOV", hasState: true },
  senator: { label: "Senador", abbr: "SEN", hasState: true },
  federal_deputy: { label: "Deputado Federal", abbr: "DEP", hasState: true },
  state_deputy: { label: "Deputado Estadual", abbr: "DEPE", hasState: true },
} as const;

export const IDEOLOGY_LABELS: Record<string, string> = {
  far_left: "Extrema Esquerda",
  left: "Esquerda",
  center_left: "Centro-Esquerda",
  center: "Centro",
  center_right: "Centro-Direita",
  right: "Direita",
  far_right: "Extrema Direita",
};

export const BRAZILIAN_STATES = [
  { code: "AC", name: "Acre" },
  { code: "AL", name: "Alagoas" },
  { code: "AM", name: "Amazonas" },
  { code: "AP", name: "Amapá" },
  { code: "BA", name: "Bahia" },
  { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" },
  { code: "MG", name: "Minas Gerais" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "MT", name: "Mato Grosso" },
  { code: "PA", name: "Pará" },
  { code: "PB", name: "Paraíba" },
  { code: "PE", name: "Pernambuco" },
  { code: "PI", name: "Piauí" },
  { code: "PR", name: "Paraná" },
  { code: "RJ", name: "Rio de Janeiro" },
  { code: "RN", name: "Rio Grande do Norte" },
  { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" },
  { code: "RS", name: "Rio Grande do Sul" },
  { code: "SC", name: "Santa Catarina" },
  { code: "SE", name: "Sergipe" },
  { code: "SP", name: "São Paulo" },
  { code: "TO", name: "Tocantins" },
] as const;

export type StateCode = (typeof BRAZILIAN_STATES)[number]["code"];

export const SCORE_DIMENSIONS = [
  "education",
  "health",
  "security",
  "economy",
  "transparency",
] as const;

export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];
