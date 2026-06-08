/**
 * Prompts para geração de stories/cards de feed.
 *
 * ─── PRINCÍPIO DE NEUTRALIDADE ─────────────────────────────────────────────────
 *
 * Stories são conteúdo informativo. NÃO são editoriais, NÃO tomam partido.
 * O campo `background_theme` descreve o TIPO DE EVENTO, não o valor político:
 *
 * - "policy_change"   = alteração de política pública (neutro por definição)
 * - "alert"           = situação de atenção pública (irregularidade, investigação)
 * - "achievement"     = evento com resultado documentado (aprovação, conclusão)
 * - "neutral"         = evento informativo sem categorização clara
 *
 * Substitui o esquema anterior "positive/negative" que introduzia viés ideológico.
 */
import type { InterpretationInput } from "../types/interpretation.types";

const SYSTEM_PROMPT = `Você é um sistema de criação de cards informativos sobre política.
Crie conteúdo estritamente factual e neutro para cidadãos que querem se informar.

REGRAS ABSOLUTAS:
1. NÃO emita opiniões políticas ou ideológicas.
2. NÃO use linguagem que favoreça ou critique qualquer político, partido ou grupo.
3. Descreva APENAS o que aconteceu — sem interpretação valorativa.
4. Use linguagem simples, acessível, sem jargão político ou técnico desnecessário.
5. Responda SOMENTE com o JSON válido solicitado. Nenhum texto adicional.

EXEMPLOS DE REDAÇÃO CORRETA:
✅ "Câmara aprova projeto que altera regras de aposentadoria"
✅ "Senado rejeita proposta de aumento de verbas para educação"
✅ "Governador sanciona lei de transparência nos gastos estaduais"

EXEMPLOS DE ERROS:
❌ "Câmara aprova importante reforma que vai melhorar a vida dos trabalhadores"
❌ "Senado bloqueia avanço social com rejeição de proposta progressista"`;

export function buildStorySystemPrompt(): string {
  return SYSTEM_PROMPT;
}

export function buildStoryUserPrompt(input: InterpretationInput): string {
  const lines: string[] = [
    `EVENTO PARA CRIAR CARD/STORY:`,
    `Tipo: ${input.type}`,
    `Título: ${input.title}`,
    `Descrição: ${input.description}`,
  ];

  if (input.politicians?.length) {
    lines.push(`Político(s): ${input.politicians.join(", ")}`);
  }

  lines.push(
    ``,
    `Crie um card informativo para feed mobile. Retorne EXATAMENTE este JSON:`,
    `{`,
    `  "title": "<título factual, máximo 80 chars — descreva O QUE aconteceu>",`,
    `  "short_summary": "<1–2 frases factuais, máximo 200 chars — sem julgamento>",`,
    `  "coverage_direction": "<expansivo|restritivo|neutro|misto>",`,
    `  "main_profiles": [{"name": "<nome completo>", "slug": "<slug-opcional>"}],`,
    `  "cta": "<chamada neutra para ação, ex: Entender melhor, Ver detalhes, Saiba mais>",`,
    `  "tags": ["<tag1>", "<tag2>"],`,
    `  "background_theme": "<policy_change|alert|achievement|neutral>",`,
    `  "relevance_score": <inteiro 0-100>`,
    `}`,
    ``,
    `GUIA background_theme (objetivo, sem julgamento de valor):`,
    `- policy_change: alteração de regra, lei ou política pública`,
    `- alert:         investigação, irregularidade ou situação de atenção documentada`,
    `- achievement:   conclusão documentada (obra entregue, meta atingida, aprovação final)`,
    `- neutral:       evento informativo sem categorização clara`,
    ``,
    `coverage_direction:`,
    `- expansivo:  aumenta cobertura, recursos ou alcance de serviço/política`,
    `- restritivo: reduz cobertura, recursos ou alcance de serviço/política`,
    `- neutro:     sem alteração de cobertura ou impacto indeterminado`,
    `- misto:      expansivo em alguns aspectos e restritivo em outros`,
  );

  return lines.join("\n");
}
