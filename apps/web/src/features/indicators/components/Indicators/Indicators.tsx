"use client";

import { useMemo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { QueryStateSection } from "@/components/ui/query-state-section";
import { useExpandableSelection } from "@/hooks/use-expandable-selection";
import { useIndicators } from "../../hooks";
import { groupIndicatorsByCategory } from "../../view-models";
import { IndicatorCategoryGroup } from "../IndicatorCategoryGroup";

export interface IndicatorsProps {
  slug: string;
}

/**
 * Orquestrador de Indicators: busca (useIndicators, já devolve View
 * Models), agrupa por categoria em memória e controla expand/collapse por
 * card — tudo sem nova chamada à API.
 */
export function Indicators({ slug }: IndicatorsProps) {
  const { data: indicators, isLoading, isError } = useIndicators(slug);
  const { expandedIds, toggle } = useExpandableSelection();

  const groups = useMemo(() => groupIndicatorsByCategory(indicators ?? []), [indicators]);

  return (
    <section aria-labelledby="indicators-heading">
      <GlassCard className="flex flex-col gap-4">
        <h2 id="indicators-heading" className="text-lg font-semibold text-foreground">
          Indicadores
        </h2>

        <QueryStateSection
          isLoading={isLoading}
          isError={isError}
          isEmpty={groups.length === 0}
          errorMessage="Não foi possível carregar os indicadores."
          emptyMessage="Nenhum indicador registrado até o momento."
        >
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <IndicatorCategoryGroup
                key={group.categoryLabel}
                group={group}
                expandedIds={expandedIds}
                onToggleExpanded={toggle}
              />
            ))}
          </div>
        </QueryStateSection>
      </GlassCard>
    </section>
  );
}
