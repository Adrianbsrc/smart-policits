import type { IntegrityRecordViewModel } from "./integrity-record.view-model";

export interface IntegrityStatusGroupViewModel {
  statusLabel: string;
  count: number;
  records: IntegrityRecordViewModel[];
}
