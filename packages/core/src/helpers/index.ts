export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeScore(raw: number, maxPossible: number): number {
  if (maxPossible === 0) return 0;
  return clamp((raw / maxPossible) * 10, 0, 10);
}

export function weightedAverage(values: Array<{ value: number; weight: number }>): number {
  const totalWeight = values.reduce((acc, { weight }) => acc + weight, 0);
  if (totalWeight === 0) return 0;
  const weighted = values.reduce((acc, { value, weight }) => acc + value * weight, 0);
  return weighted / totalWeight;
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function scoreToGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 8.5) return "A";
  if (score >= 7.0) return "B";
  if (score >= 5.5) return "C";
  if (score >= 4.0) return "D";
  return "F";
}
