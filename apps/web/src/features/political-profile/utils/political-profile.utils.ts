/** Utilitários puros de formatação para a feature political-profile — usados pelos ViewModel Mappers. */

/** "2023 — atual" ou "2019 — 2023". Sem lógica de negócio, apenas apresentação. */
export function formatMandatePeriod(startDate: Date, endDate: Date | null): string {
  const startYear = startDate.getFullYear();
  if (!endDate) return `${startYear} — atual`;
  const endYear = endDate.getFullYear();
  return `${startYear} — ${endYear}`;
}
