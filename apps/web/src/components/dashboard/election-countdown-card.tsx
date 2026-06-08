const ELECTION_DATE = new Date("2026-10-04T00:00:00-03:00");

function getDaysUntilElection(): number {
  const diff = ELECTION_DATE.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function ElectionCountdownCard() {
  const daysLeft = getDaysUntilElection();

  return (
    <div className="flex flex-col justify-center rounded-xl bg-primary/10 px-6 py-6">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
        Eleições 2026
      </p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-7xl font-extrabold leading-none tabular-nums text-foreground">
          {daysLeft}
        </span>
        <span className="text-xl font-medium text-muted-foreground">dias</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        até o 1º turno · 4 de outubro
      </p>
    </div>
  );
}
