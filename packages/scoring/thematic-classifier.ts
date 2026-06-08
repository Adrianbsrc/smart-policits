/**
 * Classificador temático baseado em palavras-chave de ementas legislativas.
 *
 * ─── METODOLOGIA (IMPARCIAL) ──────────────────────────────────────────────────
 *
 * Score temático = TAXA DE PARTICIPAÇÃO em votações classificadas no tema.
 *
 *   100 = presente e votante em todos os votos do tema
 *   50  = dado insuficiente (< MIN_VOTES_FOR_SIGNAL votos no tema) → neutro
 *   0   = ausente/abstenção em todos os votos do tema
 *
 * POR QUE NÃO AVALIAMOS "FAVORÁVEL vs CONTRÁRIO"?
 * ─────────────────────────────────────────────────
 * Determinar se um voto é "favor de saúde" ou "contra saúde" requer
 * um julgamento ideológico que varia conforme a perspectiva política.
 *
 * Exemplo: votar CONTRA uma proposta de aumento de impostos para saúde pode
 * ser interpretado como "desfavorável à saúde" ou "favorável à economia".
 * Não há critério técnico neutro que resolva essa ambiguidade.
 *
 * Esta plataforma avalia ATIVIDADE e PRESENÇA — dados objetivos e reproduzíveis.
 * Nunca avalia posicionamento político.
 *
 * ─── FONTES ──────────────────────────────────────────────────────────────────
 * Palavras-chave baseadas no vocabulário oficial de ementas da Câmara dos
 * Deputados e do Senado Federal (dados.camara.leg.br, legis.senado.leg.br).
 */

export type ThemeDimension =
  | 'education'
  | 'health'
  | 'security'
  | 'economy'
  | 'environment'
  | 'infrastructure'
  | 'technology'
  | 'agriculture'
  | 'international'
  | 'culture'
  | 'socialRights'
  | 'entrepreneurship';

export const ALL_THEMES: ThemeDimension[] = [
  'education', 'health', 'security', 'economy', 'environment',
  'infrastructure', 'technology', 'agriculture', 'international',
  'culture', 'socialRights', 'entrepreneurship',
];

/**
 * Palavras-chave por dimensão temática.
 * Vocabulário extraído de ementas legislativas brasileiras (corpus oficial).
 * Evita termos que se confundem entre temas (ex: "social" é muito genérico).
 */
const THEME_KEYWORDS: Record<ThemeDimension, string[]> = {
  education: [
    'escola', 'ensino', 'educação', 'professor', 'universidade', 'enem',
    'prouni', 'fies', 'mec', 'alfabetização', 'pedagógic', 'bolsa permanência',
    'graduação', 'pós-graduação', 'creche', 'pré-escola', 'fundamental',
    'médio escolar', 'bncc', 'ideb', 'pnaic', 'formação docente',
  ],
  health: [
    'saúde', 'sus', 'hospital', 'medicamento', 'farmácia', 'vacina', 'epidemia',
    'anvisa', 'sanitário', 'médico', 'enfermagem', 'ubs', 'atenção básica',
    'câncer', 'transplante', 'pronto-socorro', 'maternidade', 'samu',
    'vigilância sanitária', 'plano de saúde', 'ans', 'rede hospitalar',
  ],
  security: [
    'segurança pública', 'policia', 'policial', 'criminalidade', 'presídio',
    'penal', 'armamento', 'violência', 'tráfico de droga', 'prisão',
    'penitenciária', 'estatuto do desarmamento', 'porte de arma',
    'delegacia', 'investigação criminal', 'senasp', 'susp', 'bombeiro',
  ],
  economy: [
    'econom', 'tributário', 'imposto', 'fiscal', 'orçamento federal',
    'dívida pública', 'banco central', 'câmbio', 'inflação', 'taxa de juros',
    'refinanciamento', 'carga tributária', 'reforma fiscal', 'déficit primário',
    'superávit', 'crédito público', 'tesouro nacional', 'siafi', 'ldo', 'loa',
  ],
  environment: [
    'ambiental', 'floresta', 'desmatamento', 'agrotóxico', 'climát',
    'ibama', 'poluição', 'recursos hídricos', 'biodiversidade', 'resíduos',
    'reciclagem', 'emissão de carbono', 'sustentável', 'unidade de conservação',
    'mata atlântica', 'amazônia', 'cerrado', 'código florestal',
  ],
  infrastructure: [
    'rodovia', 'ferrovia', 'porto', 'aeroporto', 'saneamento básico',
    'energia elétrica', 'obra pública', 'concessão', 'mobilidade urbana',
    'pavimentação', 'abastecimento de água', 'drenagem', 'barragem',
    'usina', 'hidroelétrica', 'transmissão elétrica', 'antt', 'aneel', 'dnit',
  ],
  technology: [
    'tecnologia', 'digital', 'software', 'internet', 'inovação tecnológica',
    'cibernético', 'inteligência artificial', 'dados pessoais', 'lgpd',
    'governo digital', 'anatel', 'telecomunicação', 'computação', '5g',
    'economia digital', 'transformação digital', 'mctic', 'ciência e tecnologia',
  ],
  agriculture: [
    'agropecuária', 'rural', 'pecuária', 'soja', 'milho', 'agronegócio',
    'produtor rural', 'agricultura familiar', 'crédito rural', 'pronaf',
    'conab', 'embrapa', 'irrigação', 'insumo agrícola', 'safra',
    'reforma agrária', 'regularização fundiária', 'mapa', 'incra',
  ],
  international: [
    'acordo internacional', 'tratado', 'exportação', 'importação', 'mercosul',
    'diplomacia', 'relações exteriores', 'embaixada', 'soberania',
    'missão de paz', 'organização internacional', 'itamaraty',
    'comércio exterior', 'convenção internacional', 'protocolo',
  ],
  culture: [
    'cultura', 'arte', 'música', 'patrimônio histórico', 'folclore', 'cinema',
    'teatro', 'povo indígena', 'comunidade quilombola', 'museu', 'biblioteca',
    'literatura', 'audiovisual', 'cultura popular', 'fundação cultural',
    'lei rouanet', 'fundo setorial', 'direito autoral',
  ],
  socialRights: [
    'previdência social', 'aposentadoria', 'benefício social', 'assistência social',
    'bolsa família', 'bpc', 'loas', 'habitação', 'moradia', 'criança e adolescente',
    'idoso', 'pessoa com deficiência', 'igualdade racial', 'direitos humanos',
    'proteção social', 'cras', 'creas', 'suas', 'vulnerabilidade social',
  ],
  entrepreneurship: [
    'empreendedor', 'microempresa', 'mei', 'desburocratização',
    'simples nacional', 'abertura de empresa', 'registro comercial',
    'ambiente de negócios', 'licença para funcionar', 'sebrae',
    'fundo garantidor', 'capital empreendedor',
  ],
};

/**
 * Classifica um texto livre (ementa, título, descrição de voto) nas dimensões temáticas.
 * Retorna TODOS os temas que fazem match — um evento pode pertencer a múltiplos temas.
 */
export function classifyTextToThemes(text: string): ThemeDimension[] {
  if (!text?.trim()) return [];
  const lower = text.toLowerCase();
  const found: ThemeDimension[] = [];

  for (const theme of ALL_THEMES) {
    const keywords = THEME_KEYWORDS[theme];
    if (keywords.some((kw) => lower.includes(kw))) {
      found.push(theme);
    }
  }

  return found;
}

/** Representa um voto classificado. */
export interface ClassifiedVote {
  /** Ex: "Sim" | "Não" | "Abstenção" | "Obstrução" | "Ausência" | "Art. 17" */
  tipoVoto: string;
  /** Descrição ou ementa da votação/proposição votada. */
  descricao: string;
}

/** Mínimo de votações registradas em um tema para considerar o score significativo. */
const MIN_VOTES_FOR_SIGNAL = 3;

/**
 * Calcula scores temáticos a partir de registros de votação.
 *
 * Algoritmo:
 *  1. Para cada voto, classifica a descrição em temas.
 *  2. Conta `present` (voto registrado ≠ ausência/abstenção) e `total` por tema.
 *  3. score = presente / total × 100 (arredondado).
 *  4. Se total < MIN_VOTES_FOR_SIGNAL → 50 (dado insuficiente — valor neutro).
 *
 * Retorna Record<ThemeDimension, number> com valores 0–100.
 */
export function calcThematicActivityScores(
  votes: ClassifiedVote[],
): Record<ThemeDimension, number> {
  // Inicializa contadores
  const counts = {} as Record<ThemeDimension, { present: number; total: number }>;
  for (const theme of ALL_THEMES) {
    counts[theme] = { present: 0, total: 0 };
  }

  // Tipos de voto que indicam AUSÊNCIA DO PROCESSO DECISÓRIO
  const ABSENT_TYPES = new Set([
    'ausência', 'abstenção', 'art. 17', 'liberado', 'obstrução',
  ]);

  for (const vote of votes) {
    const themes = classifyTextToThemes(vote.descricao);
    if (themes.length === 0) continue;

    const isPresent = !ABSENT_TYPES.has(vote.tipoVoto.toLowerCase().trim());

    for (const theme of themes) {
      counts[theme].total++;
      if (isPresent) counts[theme].present++;
    }
  }

  const result = {} as Record<ThemeDimension, number>;
  for (const theme of ALL_THEMES) {
    const { present, total } = counts[theme];
    // Dado insuficiente → 50 (neutro), não penaliza nem premia
    result[theme] = total < MIN_VOTES_FOR_SIGNAL
      ? 50
      : Math.round((present / total) * 100);
  }

  return result;
}

/**
 * Converte Record<ThemeDimension, number> (0–100) para ThematicInput (esperado pelo scoring engine).
 * ThematicInput usa a mesma escala 0–100.
 */
export function themesToThematicInput(
  scores: Record<ThemeDimension, number>,
): Record<ThemeDimension, number> {
  return { ...scores };
}
