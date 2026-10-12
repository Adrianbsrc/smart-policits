/**
 * View Model — forma pronta para exibição. NUNCA conhece a API/DTO: só
 * importa tipos de models/ (Domain) e de si mesma. Componentes só
 * conhecem View Models, nunca Domain Models nem DTOs.
 *
 * Deliberadamente não existe nenhum campo de cor/variante por status
 * (ex: "statusVariant") — a SPEC exige que nenhum estado processual seja
 * destacado visualmente ou receba cor que induza julgamento. Todo status
 * usa o mesmo estilo neutro no componente.
 */

export interface IntegrityEvidenceViewModel {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  sourceLabel: string;
}

export interface IntegrityRecordViewModel {
  id: string;
  title: string;
  summary: string;
  description: string;
  categoryLabel: string;
  statusLabel: string;
  dateLabel: string;
  sourceLabel: string;
  evidences: IntegrityEvidenceViewModel[];
}
