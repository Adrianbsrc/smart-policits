export type JobLogLevel = "info" | "warn" | "error";

export interface JobLogEntry {
  readonly level: JobLogLevel;
  readonly message: string;
  readonly timestamp: Date;
  readonly meta?: Record<string, unknown>;
}

/** Log estruturado de uma execução de Job (ver docs/SPECs/etl.md#logs). */
export interface JobLogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  getEntries(): JobLogEntry[];
}

export class InMemoryJobLogger implements JobLogger {
  private readonly entries: JobLogEntry[] = [];

  info(message: string, meta?: Record<string, unknown>): void {
    this.push("info", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.push("warn", message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.push("error", message, meta);
  }

  getEntries(): JobLogEntry[] {
    return [...this.entries];
  }

  private push(level: JobLogLevel, message: string, meta?: Record<string, unknown>): void {
    this.entries.push({ level, message, timestamp: new Date(), meta });
  }
}
