"use client";

import { useMemo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { QueryStateSection } from "@/components/ui/query-state-section";
import { useExpandableSelection } from "@/hooks/use-expandable-selection";
import { usePromises } from "../../hooks";
import { groupPromisesByStatus } from "../../view-models";
import { PromiseStatusGroup } from "../PromiseStatusGroup";

export interface PromisesProps {
  slug: string;
}

/**
 * Orquestrador de Promises: busca (usePromises, já devolve View Models),
 * agrupa por status em memória e controla expand/collapse por card — tudo
 * sem nova chamada à API.
 */
export function Promises({ slug }: PromisesProps) {
  const { data: promises, isLoading, isError } = usePromises(slug);
  const { expandedIds, toggle } = useExpandableSelection();

  const groups = useMemo(() => groupPromisesByStatus(promises ?? []), [promises]);

  return (
    <section aria-labelledby="promises-heading">
      <GlassCard className="flex flex-col gap-4">
        <h2 id="promises-heading" className="text-lg font-semibold text-foreground">
          Promessas
        </h2>

        <QueryStateSection
          isLoading={isLoading}
          isError={isError}
          isEmpty={groups.length === 0}
          errorMessage="Não foi possível carregar as promessas."
          emptyMessage="Nenhuma promessa registrada até o momento."
        >
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <PromiseStatusGroup
                key={group.statusLabel}
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
