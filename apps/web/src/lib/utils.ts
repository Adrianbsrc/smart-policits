import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function scoreToPercent(score: number, max = 10): number {
  return Math.min(Math.max((score / max) * 100, 0), 100);
}
