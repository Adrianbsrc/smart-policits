import { cn } from "@/lib/utils";
import { scoreToPercent } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  size?: "sm" | "md";
}

function scoreColorVar(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.75) return "var(--success)";
  if (pct >= 0.5) return "var(--primary)";
  if (pct >= 0.3) return "var(--warning)";
  return "var(--destructive)";
}

export function ScoreBar({ label, score, max = 10, className, showValue = true, size = "md" }: ScoreBarProps) {
  const percent = scoreToPercent(score, max);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between">
        <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
          {label}
        </span>
        {showValue && (
          <span className={cn("font-semibold tabular-nums", size === "sm" ? "text-xs" : "text-sm")}>
            {score.toFixed(1)}
          </span>
        )}
      </div>
      <div className={cn("overflow-hidden rounded-full bg-muted", size === "sm" ? "h-1.5" : "h-2")}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: scoreColorVar(score, max) }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${score.toFixed(1)} de ${max}`}
        />
      </div>
    </div>
  );
}

interface ScoreRingProps {
  score: number;
  max?: number;
  size?: number;
  className?: string;
}

export function ScoreRing({ score, max = 10, size = 56, className }: ScoreRingProps) {
  const percent = scoreToPercent(score, max);
  const strokeColor = scoreColorVar(score, max);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} className="fill-none stroke-muted" strokeWidth={4} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none transition-all duration-700"
          style={{ stroke: strokeColor }}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums">{score.toFixed(1)}</span>
    </div>
  );
}
