export * from "./camara";

export interface SyncResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}
