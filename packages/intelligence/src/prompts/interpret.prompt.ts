/**
 * Prompts para interpretação de eventos políticos.
 *
 * ─── PRINCÍPIO DE NEUTRALIDADE ─────────────────────────────────────────────────
 *
 * Este sistema NÃO avalia se políticas são boas ou ruins.
 * NÃO classifica políticos como melhores ou piores.
 * NÃO favorece nenhuma ideologia, partido ou grupo político.
 *
 * O que fazemos:
 * - Classificar eventos em categorias temáticas objetivas.
 * - Descrever o que o evento FARÁ (ampliar/reduzir serviços, alterar orçamento).
 * - Medir relevância pelo impacto em número de pessoas afetadas.
 *
 * O campo `coverage_direction`:
 * - "expansivo"  = aumenta cobertura/recursos/alcance de um serviço público
 * - "restritivo" = reduz cobertura/recursos/alcance de um serviço público
 * - "neutro"     = sem alteração de cobertura ou impacto incerto
 * - "misto"      = expansivo em alguns aspectos, restritivo em outros
 *
 * IMPORTANTE: "expansivo" NÃO significa bom. "restritivo" NÃO significa ruim.
 * São apenas direções de mudança objetivas, sem julgamento de valor.
 * Exemplo:
 *   - Proposta de corte de gastos públicos → "restritivo" (não "negativo")
 *   - Proposta de criação de benefício social → "expansivo" (não "positivo")
 *   Ambas são legítimas dependendo da perspectiva política do cidadão.
 */
import type { InterpretationInput } from "../types/interpretation.types";

const INPUT_TYPE_LABELS: Record<string, string> = {
  bill:             "Projeto de Lei",
  vote:             "Votação",
  decree:           "Decreto",
  executive_action: "Ação Executiva",
  news:             "Notícia / Pauta",
  spending:         "Gasto Público",
};

const SYSTEM_PROMPT = `Você é um sistema de classificação de dados políticos. Sua função é ÚNICA E EXCLUSIVAMENTE classificar e descrever eventos políticos de forma factual e objetiva.

REGRAS ABSOLUTAS — NUNCA VIOLAR:
1. NÃO emita opiniões políticas ou ideológicas.
2. NÃO classifique políticos como bons, ruins, eficientes ou ineficientes.
3. NÃO use linguagem de campanha, militante, partidária ou advocacy.
4. NÃO infira se uma política é "boa para os pobres", "boa para o país", etc.
5. NÃO compare políticos entre si.
6. NÃO use adjetivos valorativos (ótimo, péssimo, excelente, terrível).
7. Descreva APENAS o que o evento LITERALMENTE faz (ex: "altera", "cria", "extingue", "aumenta", "reduz").
8. Responda SOMENTE com o JSON válido solicitado. Nenhum texto adicional.

EXEMPLOS DE ERROS A EVITAR:
❌ "Esta lei beneficia as famílias mais pobres"
✅ "Esta lei aumenta o valor do benefício de R$ X para R$ Y"

❌ "O político votou a favor dos trabalhadores"
✅ "O político votou favorável à aprovação do PL 123/2023"

❌ "Esta proposta é prejudicial ao meio ambiente"
✅ "Esta proposta reduz a área de proteção ambiental em X%"`;

const CATEGORIES_GUIDE = `CATEGORIAS (use as mais relevantes, outras são aceitas se pertinentes):
segurança pública, saúde, educação, economia, meio ambiente, infraestrutura, tecnologia, agropecuária, relações internacionais, cultura, direitos sociais, empreendedorismo, justiça, tributação, previdência, habitação, transporte, energia, trabalho, defesa`;

const TOPICS_GUIDE = `TOPICS (use APENAS estas chaves exatas — são identificadores do sistema):
education, health, security, economy, environment, infrastructure, technology, agriculture, international, culture, socialRights, entrepreneurship`;

const RELEVANCE_GUIDE = `CRITÉRIOS DE relevance_score (0–100) — baseado em ALCANCE OBJETIVO:
0–20:  afeta localidade específica ou grupo muito restrito
21–40: afeta um setor ou categoria profissional
41–60: alcance estadual ou setor relevante da população
61–80: alcance nacional, impacto em milhões de cidadãos
81–100: impacto nacional crítico (orçamento federal, direitos fundamentais, estrutura do Estado)`;

const COVERAGE_GUIDE = `CAMPO coverage_direction — direção da mudança em cobertura/recursos (SEM julgamento de valor):
"expansivo"  = aumenta cobertura, recursos, alcance ou beneficiários de serviço/política
"restritivo" = reduz cobertura, recursos, alcance ou beneficiários de serviço/política
"neutro"     = sem alteração de cobertura ou impacto indeterminado
"misto"      = expansivo em alguns aspectos e restritivo em outros simultaneamente

ATENÇÃO: "expansivo" ≠ positivo. "restritivo" ≠ negativo. São apenas direções de mudança.`;

export function buildInterpretSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

export function buildInterpretUserPrompt(input: InterpretationInput): string {
  const typeLabel = INPUT_TYPE_LABELS[input.type] ?? input.type;
  const lines: string[] = [
    `EVENTO A CLASSIFICAR:`,
    `Tipo: ${typeLabel}`,
    `Título: ${input.title}`,
    `Descrição: ${input.description}`,
  ];

  if (input.date) lines.push(`Data: ${input.date}`);
  if (input.politicians?.length) {
    lines.push(`Político(s) envolvido(s): ${input.politicians.join(", ")}`);
  }

  lines.push(
    ``,
    CATEGORIES_GUIDE,
    ``,
    TOPICS_GUIDE,
    ``,
    RELEVANCE_GUIDE,
    ``,
    COVERAGE_GUIDE,
    ``,
    `Retorne EXATAMENTE este JSON (sem markdown, sem texto adicional):`,
    `{`,
    `  "categories": ["<categoria1>", "<categoria2>"],`,
    `  "summary_simple": "<descrição factual em 1–2 frases do que o evento FAZ — sem julgamento>",`,
    `  "possible_impacts": ["<impacto factual 1>", "<impacto factual 2>"],`,
    `  "coverage_direction": "<expansivo|restritivo|neutro|misto>",`,
    `  "complexity": "<baixa|média|alta>",`,
    `  "relevance_score": <inteiro 0-100>,`,
    `  "topics": ["<topic_key1>", "<topic_key2>"]`,
    `}`,
  );

  return lines.join("\n");
}
