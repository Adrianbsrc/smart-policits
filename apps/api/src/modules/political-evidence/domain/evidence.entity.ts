import type { EvidenceAttachment } from "./evidence-attachment.entity";
import type { EvidenceCategory } from "./evidence-category.enum";
import type { EvidenceContext } from "./evidence-context.entity";
import type { EvidenceImpact } from "./evidence-impact.enum";
import type { EvidenceReliability } from "./evidence-reliability.enum";
import type { EvidenceSource } from "./evidence-source.entity";

/**
 * Evidence — menor unidade de informação verificável da plataforma
 * (docs/SPECs/evidence.md). Domínio central: Timeline, Integrity, Promises,
 * Assessment, Feed e Comparação devem ser construídos a partir de Evidence.
 *
 * Regras (nunca violar):
 * - Evidence é um fato, nunca uma opinião.
 * - Evidence nunca calcula score.
 * - Evidence nunca conhece Timeline, Assessment ou Integrity — são eles que
 *   conhecem Evidence, nunca o contrário.
 *
 * Nota de cardinalidade: a task pede os campos "category"/"source"/"context"
 * no singular, mas as seções CLASSIFICAÇÃO/SOURCE/CONTEXT (e docs/SPECs/
 * evidence.md#relacionamentos) exigem explicitamente múltiplos valores —
 * por isso os campos abaixo são arrays (`categories`/`sources`/`contexts`),
 * a forma mais capaz que ainda cobre o caso de valor único (array de 1).
 *
 * `mandateId` e `impact` vêm de docs/SPECs/evidence.md e docs/SPECs/
 * timeline.md respectivamente — não estão na lista mínima da task, mas são
 * necessários para a Timeline parar de calcular sua própria importância.
 */
export interface Evidence {
  id: string;
  politicalProfileId: string;
  mandateId: string | null;
  title: string;
  summary: string;
  description: string;
  occurredAt: Date;
  publishedAt: Date | null;
  categories: EvidenceCategory[];
  impact: EvidenceImpact;
  reliability: EvidenceReliability;
  sources: EvidenceSource[];
  contexts: EvidenceContext[];
  attachments: EvidenceAttachment[];
  tags: string[];
  /** Metadados livres e serializáveis (ex.: proveniência do ETL) — nunca `any`/`unknown`. */
  metadata: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}
