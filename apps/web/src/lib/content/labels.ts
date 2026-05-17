export const OFFICE_LABELS: Record<string, string> = {
  president: "Presidente",
  governor: "Governador(a)",
  senator: "Senador(a)",
  federal_deputy: "Deputado(a) Federal",
  state_deputy: "Deputado(a) Estadual",
};

export const OFFICE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "president", label: "Presidente" },
  { value: "governor", label: "Governador(a)" },
  { value: "senator", label: "Senador(a)" },
  { value: "federal_deputy", label: "Deputado(a) Federal" },
  { value: "state_deputy", label: "Deputado(a) Estadual" },
] as const;

export const STATE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "AC", label: "AC" },
  { value: "AL", label: "AL" },
  { value: "AM", label: "AM" },
  { value: "AP", label: "AP" },
  { value: "BA", label: "BA" },
  { value: "CE", label: "CE" },
  { value: "DF", label: "DF" },
  { value: "ES", label: "ES" },
  { value: "GO", label: "GO" },
  { value: "MA", label: "MA" },
  { value: "MG", label: "MG" },
  { value: "MS", label: "MS" },
  { value: "MT", label: "MT" },
  { value: "PA", label: "PA" },
  { value: "PB", label: "PB" },
  { value: "PE", label: "PE" },
  { value: "PI", label: "PI" },
  { value: "PR", label: "PR" },
  { value: "RJ", label: "RJ" },
  { value: "RN", label: "RN" },
  { value: "RO", label: "RO" },
  { value: "RR", label: "RR" },
  { value: "RS", label: "RS" },
  { value: "SC", label: "SC" },
  { value: "SE", label: "SE" },
  { value: "SP", label: "SP" },
  { value: "TO", label: "TO" },
] as const;

export const SCORE_LABELS = {
  education: "Educação",
  health: "Saúde",
  security: "Segurança",
  economy: "Economia",
  transparency: "Transp.",
  environment: "Meio Amb.",
  infrastructure: "Infraestr.",
  technology: "Tecnologia",
  agriculture: "Agro",
  international: "Internac.",
  culture: "Cultura",
  socialRights: "Dir. Sociais",
  entrepreneurship: "Empreend.",
} as const;

export const SCORE_LABELS_FULL = {
  education: "Educação",
  health: "Saúde",
  security: "Segurança",
  economy: "Economia",
  transparency: "Transparência",
  environment: "Meio Ambiente",
  infrastructure: "Infraestrutura",
  technology: "Tecnologia & Inovação",
  agriculture: "Agricultura & Agro",
  international: "Relações Internacionais",
  culture: "Cultura & Esporte",
  socialRights: "Direitos Sociais",
  entrepreneurship: "Empreendedorismo",
} as const;

export const SCORE_MAIN_KEYS = [
  "education", "health", "security", "economy", "transparency",
] as const;

export const SCORE_EXTENDED_KEYS = [
  "environment", "infrastructure", "technology", "agriculture",
  "international", "culture", "socialRights", "entrepreneurship",
] as const;
