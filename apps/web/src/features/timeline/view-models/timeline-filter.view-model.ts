import type { TimelineCategory } from "../models";

export interface TimelineFilterOption {
  value: TimelineCategory | "all";
  label: string;
}
