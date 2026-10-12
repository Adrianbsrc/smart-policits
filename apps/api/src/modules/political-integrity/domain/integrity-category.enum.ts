export const INTEGRITY_CATEGORIES = [
  "corruption",
  "misconduct",
  "electoral_crime",
  "financial_crime",
  "administrative_process",
  "audit_court",
  "other",
] as const;

export type IntegrityCategory = (typeof INTEGRITY_CATEGORIES)[number];
