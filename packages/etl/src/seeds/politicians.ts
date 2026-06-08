/**
 * Seed canônico de governadores e presidentes.
 *
 * Estes dados são estáticos (não vêm de APIs oficiais) e representam
 * mandatos e pré-candidaturas conhecidas. Para adicionar um novo político,
 * insira aqui e rode POST /api/etl/sync/governors ou /sync/presidents.
 */

export interface SeedPolitician {
  /** ID único — formato "gov-XX" ou "pres-NNN". Nunca altere após inserção. */
  tseId: string;
  name: string;
  office: "president" | "governor";
  state?: string;
  party: string;
  photoUrl?: string;
  bio?: string;
  isPreCandidate?: boolean;
  candidateYear?: number;
  /** Número na urna para cola eleitoral (ex: 22 para presidente, 15 para governador). */
  candidateNumber?: number;
  /** Declarado inelegível pelo TSE (ficha suja confirmada). */
  fichaLimpaIneligible?: boolean;
  /** Status do mandato. Padrão: "in_mandate" para governadores e presidente atual. */
  status?: "pre_candidate" | "candidate" | "elected" | "in_mandate" | "former" | "inactive";
}

// ─── Governadores — mandato 2023-2027 ────────────────────────────────────────
// Para adicionar um novo governador: acrescente um objeto abaixo com tseId único.

export const GOVERNORS_SEED: SeedPolitician[] = [
  { tseId: "gov-ac", name: "Gladson Cameli",             office: "governor", state: "AC", party: "PP" },
  { tseId: "gov-al", name: "Paulo Dantas",                office: "governor", state: "AL", party: "MDB" },
  { tseId: "gov-am", name: "Wilson Lima",                 office: "governor", state: "AM", party: "UNIÃO" },
  { tseId: "gov-ap", name: "Clécio Luís",                 office: "governor", state: "AP", party: "SOLIDARIEDADE" },
  { tseId: "gov-ba", name: "Jerônimo Rodrigues",          office: "governor", state: "BA", party: "PT" },
  { tseId: "gov-ce", name: "Elmano de Freitas",           office: "governor", state: "CE", party: "PT" },
  { tseId: "gov-df", name: "Ibaneis Rocha",               office: "governor", state: "DF", party: "MDB" },
  { tseId: "gov-es", name: "Renato Casagrande",           office: "governor", state: "ES", party: "PSB" },
  {
    tseId: "gov-go", name: "Ronaldo Caiado", office: "governor", state: "GO", party: "UNIÃO",
    isPreCandidate: true, candidateYear: 2026,
    bio: "Governador de Goiás. Médico e político. Administração com foco em segurança pública e desenvolvimento econômico regional.",
  },
  { tseId: "gov-ma", name: "Carlos Brandão",              office: "governor", state: "MA", party: "PSB" },
  {
    tseId: "gov-mg", name: "Romeu Zema", office: "governor", state: "MG", party: "NOVO",
    isPreCandidate: true, candidateYear: 2026,
    bio: "Governador de Minas Gerais. Empresário do setor agropecuário. Defensor da austeridade fiscal e da redução do papel do Estado.",
  },
  { tseId: "gov-ms", name: "Eduardo Riedel",              office: "governor", state: "MS", party: "PSDB" },
  { tseId: "gov-mt", name: "Mauro Mendes",                office: "governor", state: "MT", party: "UNIÃO" },
  { tseId: "gov-pa", name: "Helder Barbalho",             office: "governor", state: "PA", party: "MDB" },
  { tseId: "gov-pb", name: "João Azevêdo",                office: "governor", state: "PB", party: "PSB" },
  { tseId: "gov-pe", name: "Raquel Lyra",                 office: "governor", state: "PE", party: "PSDB" },
  { tseId: "gov-pi", name: "Rafael Fonteles",             office: "governor", state: "PI", party: "PT" },
  {
    tseId: "gov-pr", name: "Carlos Massa Ratinho Junior", office: "governor", state: "PR", party: "PSD",
    isPreCandidate: true, candidateYear: 2026,
    bio: "Governador do Paraná. Administrador e político com forte apoio popular no Sul do Brasil.",
  },
  { tseId: "gov-rj", name: "Cláudio Castro",              office: "governor", state: "RJ", party: "PL" },
  { tseId: "gov-rn", name: "Fátima Bezerra",              office: "governor", state: "RN", party: "PT" },
  { tseId: "gov-ro", name: "Marcos Rocha",                office: "governor", state: "RO", party: "UNIÃO" },
  { tseId: "gov-rr", name: "Arthur Henrique",             office: "governor", state: "RR", party: "MDB" },
  {
    tseId: "gov-rs", name: "Eduardo Leite", office: "governor", state: "RS", party: "PSDB",
    isPreCandidate: true, candidateYear: 2026,
    bio: "Governador do Rio Grande do Sul. Advogado e ex-prefeito de Pelotas. Referência em reformas de gestão pública e responsabilidade fiscal.",
  },
  { tseId: "gov-sc", name: "Jorginho Mello",              office: "governor", state: "SC", party: "PL" },
  { tseId: "gov-se", name: "Fábio Mitidieri",             office: "governor", state: "SE", party: "PSD" },
  {
    tseId: "gov-sp", name: "Tarcísio de Freitas", office: "governor", state: "SP", party: "REPUBLICANOS",
    isPreCandidate: true, candidateYear: 2026,
    bio: "Governador do Estado de São Paulo. Ex-ministro da Infraestrutura. Engenheiro militar com histórico de obras de infraestrutura e concessões.",
  },
  { tseId: "gov-to", name: "Wanderlei Barbosa",           office: "governor", state: "TO", party: "REPUBLICANOS" },
];

// ─── Presidentes e pré-candidatos à presidência ───────────────────────────────
// Para adicionar um novo pré-candidato: acrescente aqui com tseId "pres-NNN" único.

export const PRESIDENTS_SEED: SeedPolitician[] = [
  {
    tseId: "pres-001", name: "Luiz Inácio Lula da Silva", office: "president", party: "PT",
    isPreCandidate: true, candidateYear: 2026, status: "in_mandate",
    bio: "35º Presidente da República Federativa do Brasil. Ex-presidente de 2003 a 2010. Fundador do Partido dos Trabalhadores. Histórico de políticas de distribuição de renda e redução da pobreza.",
  },
  {
    tseId: "pres-002", name: "Jair Messias Bolsonaro", office: "president", party: "PL",
    fichaLimpaIneligible: true, status: "former",
    bio: "Ex-presidente da República (2019-2022). Declarado inelegível pelo TSE até 2030 por abuso de poder político.",
  },
  {
    tseId: "pres-003", name: "Ciro Gomes", office: "president", party: "PDT",
    isPreCandidate: true, candidateYear: 2026,
    bio: "Economista, ex-governador do Ceará e ex-ministro. Candidato à presidência em múltiplas disputas. Defensor do desenvolvimento nacional.",
  },
  {
    tseId: "pres-004", name: "Simone Tebet", office: "president", party: "MDB",
    bio: "Ex-senadora pelo Mato Grosso do Sul e ex-candidata à Presidência. Professora universitária e defensora da pauta fiscal e educacional.",
  },
  {
    tseId: "pres-005", name: "Soraya Thronicke", office: "president", party: "UNIÃO",
    bio: "Senadora pelo Mato Grosso do Sul. Advogada e ex-candidata à Presidência. Defensora da autonomia parlamentar e reforma política.",
  },
  {
    tseId: "pres-006", name: "Flávio Bolsonaro", office: "president", party: "PL",
    state: "RJ", isPreCandidate: true, candidateYear: 2026, status: "in_mandate",
    bio: "Senador pelo Rio de Janeiro. Filho do ex-presidente Jair Bolsonaro. Advogado com atuação nas comissões do Senado.",
  },
  {
    tseId: "pres-007", name: "Aldo Rebelo", office: "president", party: "SOLIDARIEDADE",
    isPreCandidate: true, candidateYear: 2026, status: "former",
    bio: "Ex-deputado federal, ex-senador e ex-ministro. Formado em História pela USP. Defensor do desenvolvimento nacional soberano.",
  },
  {
    tseId: "pres-008", name: "Augusto Cury", office: "president", party: "REPUBLICANOS",
    isPreCandidate: true, candidateYear: 2026, status: "pre_candidate",
    bio: "Psiquiatra, neurocientista e escritor. Autor de best-sellers sobre saúde mental. Candidato com perfil independente focado em educação emocional.",
  },
  {
    tseId: "pres-009", name: "Cabo Daciolo", office: "president", party: "PATRIOTA",
    isPreCandidate: true, candidateYear: 2026, status: "former",
    bio: "Ex-deputado federal pelo Rio de Janeiro. Ex-bombeiro militar. Candidato à presidência em 2018.",
  },
  {
    tseId: "pres-010", name: "Renan Santos", office: "president", party: "NOVO",
    isPreCandidate: true, candidateYear: 2026, status: "pre_candidate",
    bio: "Liderança do Movimento Brasil Livre (MBL). Vereador por São Paulo. Defensor do liberalismo econômico e da liberdade de expressão.",
  },
  {
    tseId: "pres-011", name: "Hertz Dias", office: "president", party: "PCB",
    isPreCandidate: true, candidateYear: 2026, status: "pre_candidate",
    bio: "Dirigente nacional do Partido Comunista Brasileiro. Defensor da plataforma socialista ortodoxa.",
  },
  {
    tseId: "pres-012", name: "Rui Costa Pimenta", office: "president", party: "PCO",
    isPreCandidate: true, candidateYear: 2026, status: "pre_candidate",
    bio: "Dirigente nacional do Partido da Causa Operária. Defensor da luta operária revolucionária.",
  },
  {
    tseId: "pres-013", name: "Edmilson Costa", office: "president", party: "PCB",
    isPreCandidate: true, candidateYear: 2026, status: "pre_candidate",
    bio: "Dirigente nacional do Partido Comunista Brasileiro.",
  },
  {
    tseId: "pres-014", name: "Samara Martins", office: "president", party: "PODE",
    isPreCandidate: true, candidateYear: 2026, status: "pre_candidate",
    bio: "Pré-candidata à presidência. Dados em processo de verificação.",
  },
];
