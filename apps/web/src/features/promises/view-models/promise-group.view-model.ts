import type { PromiseViewModel } from "./promise.view-model";

export interface PromiseStatusGroupViewModel {
  statusLabel: string;
  promises: PromiseViewModel[];
}
