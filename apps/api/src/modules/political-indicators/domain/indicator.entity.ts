import type { Source } from "@smart-politics/core";
import type { IndicatorCategory } from "./indicator-category.enum";

/** Camada de domínio (framework/Prisma-agnóstica) do módulo Indicators. */
export interface IndicatorValue {
  period: string;
  value: number;
  variation: number | null;
  notes: string | null;
}

export interface Indicator {
  id: string;
  name: string;
  category: IndicatorCategory;
  description: string;
  unit: string;
  values: IndicatorValue[];
  source: Source;
}
