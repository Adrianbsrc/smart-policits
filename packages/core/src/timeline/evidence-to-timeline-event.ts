import type { TimelineCategory, TimelineEvent, TimelineImportance } from "./timeline-event";

/**
 * Forma mínima de Evidence exigida por esta transformação — nunca importa o
 * tipo completo de Evidence de apps/api ou apps/web (isso criaria
 * dependência de packages/core para dentro de um app, invertendo a direção
 * correta de importação). Qualquer Evidence real satisfaz esta forma
 * estruturalmente, sem precisar declarar "implements" nem fazer cast.
 */
export interface EvidenceForTimeline {
  id: string;
  title: string;
  summary: string;
  occurredAt: Date;
  /** Vocabulário completo de categorias de Evidence (20 valores, docs/SPECs/core/evidence.md) — mais amplo que o de Timeline (9). */
  categories: readonly string[];
  /** Mesmo vocabulário de TimelineImportance — Timeline nunca calcula importância própria, sempre herda de Evidence.impact. */
  impact: TimelineImportance;
  sources: ReadonlyArray<{ name: string; url: string | null }>;
}

const NO_SOURCE_LABEL = "Fonte não informada";

/**
 * Reduz o vocabulário de 20 categorias de Evidence para as 9 categorias
 * temáticas da Timeline (docs/SPECs/core/timeline.md#filtros). Mapeamento
 * many-to-one; uma Evidence com múltiplas categorias usa apenas a primeira.
 */
const EVIDENCE_TO_TIMELINE_CATEGORY: Record<string, TimelineCategory> = {
  biography: "biography",
  professional_career: "biography",
  political_career: "government",
  government_program: "government",
  promise: "promises",
  public_expense: "economy",
  asset: "assets",
  indicator: "economy",
  government_decision: "government",
  appointment: "government",
  law: "government",
  decree: "government",
  interview: "biography",
  public_statement: "biography",
  investigation: "integrity",
  judicial_decision: "integrity",
  audit: "integrity",
  transparency: "integrity",
  historical_event: "government",
  external_event: "government",
};

const DEFAULT_TIMELINE_CATEGORY: TimelineCategory = "government";

function resolveTimelineCategory(categories: readonly string[]): TimelineCategory {
  const [first] = categories;
  if (!first) return DEFAULT_TIMELINE_CATEGORY;
  return EVIDENCE_TO_TIMELINE_CATEGORY[first] ?? DEFAULT_TIMELINE_CATEGORY;
}

/**
 * Única implementação da transformação Evidence → Timeline no monorepo
 * (docs/SPECs/core/timeline.md#api). Backend e qualquer consumidor futuro
 * (script, outro app) importam esta função em vez de reimplementar a
 * tradução de categoria/fonte/importância.
 */
export function mapEvidenceToTimelineEvent(evidence: EvidenceForTimeline): TimelineEvent {
  const primarySource = evidence.sources[0];

  return {
    id: evidence.id,
    title: evidence.title,
    summary: evidence.summary,
    occurredAt: evidence.occurredAt,
    category: resolveTimelineCategory(evidence.categories),
    importance: evidence.impact,
    source: primarySource ? { name: primarySource.name, url: primarySource.url } : { name: NO_SOURCE_LABEL, url: null },
    expandable: evidence.summary.length > 0,
  };
}

export function mapEvidencesToTimelineEvents(evidences: EvidenceForTimeline[]): TimelineEvent[] {
  return evidences
    .map(mapEvidenceToTimelineEvent)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}
