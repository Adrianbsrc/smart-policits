import { cn } from "@/lib/utils";

interface ScoreRingProps {
  /** Valor do score, escala 0–10 */
  value: number | null;
  /** Diâmetro em px */
  size?: number;
  /** Espessura da linha */
  stroke?: number;
  /** Classe extra para o wrapper */
  className?: string;
  /** Mostra label abaixo do valor */
  showLabel?: boolean;
}

function getScoreColor(value: number | null): string {
  if (value === null) return "var(--color-muted-foreground)";
  if (value >= 8) return "var(--color-primary)";
  if (value >= 6) return "var(--color-foreground-muted)";
  return "var(--color-destructive)";
}

/**
 * Anel SVG de score no estilo Liquid Civic.
 * Escala: 0–10. Renderiza "—" quando value é null (dado indisponível).
 */
export function ScoreRing({
  value,
  size = 56,
  stroke = 5,
  className,
  showLabel = false,
}: ScoreRingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = value === null ? 0 : Math.min(10, Math.max(0, value)) / 10;
  const dashoffset = circ * (1 - pct);
  const color = getScoreColor(value);
  const center = size / 2;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-border"
        />
        {/* Progress */}
        {value !== null && (
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* Valor central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-bold tabular-nums leading-none"
          style={{
            fontSize: size * 0.28,
            color: value === null ? "var(--color-muted-foreground)" : "var(--color-foreground)",
          }}
        >
          {value === null ? "—" : value.toFixed(1)}
        </span>
        {showLabel && (
          <span
            className="mt-0.5 font-mono uppercase tracking-wider text-muted-foreground"
            style={{ fontSize: size * 0.13 }}
          >
            score
          </span>
        )}
      </div>
    </div>
  );
}
