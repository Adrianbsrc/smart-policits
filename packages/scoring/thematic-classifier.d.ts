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
export type ThemeDimension = 'education' | 'health' | 'security' | 'economy' | 'environment' | 'infrastructure' | 'technology' | 'agriculture' | 'international' | 'culture' | 'socialRights' | 'entrepreneurship';
export declare const ALL_THEMES: ThemeDimension[];
/**
 * Classifica um texto livre (ementa, título, descrição de voto) nas dimensões temáticas.
 * Retorna TODOS os temas que fazem match — um evento pode pertencer a múltiplos temas.
 */
export declare function classifyTextToThemes(text: string): ThemeDimension[];
/** Representa um voto classificado. */
export interface ClassifiedVote {
    /** Ex: "Sim" | "Não" | "Abstenção" | "Obstrução" | "Ausência" | "Art. 17" */
    tipoVoto: string;
    /** Descrição ou ementa da votação/proposição votada. */
    descricao: string;
}
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
export declare function calcThematicActivityScores(votes: ClassifiedVote[]): Record<ThemeDimension, number>;
/**
 * Converte Record<ThemeDimension, number> (0–100) para ThematicInput (esperado pelo scoring engine).
 * ThematicInput usa a mesma escala 0–100.
 */
export declare function themesToThematicInput(scores: Record<ThemeDimension, number>): Record<ThemeDimension, number>;
//# sourceMappingURL=thematic-classifier.d.ts.map