"use client";

import { useMemo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { QueryStateSection } from "@/components/ui/query-state-section";
import { useExpandableSelection } from "@/hooks/use-expandable-selection";
import { useIntegrity } from "../../hooks";
import { groupIntegrityRecordsByStatus } from "../../view-models";
import { IntegrityStatusGroup } from "../IntegrityStatusGroup";

export interface IntegrityProps {
  slug: string;
}

/**
 * Todos os status são sempre exibidos — nunca ocultar absolvições,
 * arquivamentos ou investigações (regra explícita da SPEC). Não há filtro
 * de status nesta feature de propósito: a plataforma informa, o usuário
 * conclui.
 */
export function Integrity({ slug }: IntegrityProps) {
  const { data: records, isLoading, isError } = useIntegrity(slug);
  const { expandedIds, toggle } = useExpandableSelection();

  const groups = useMemo(() => groupIntegrityRecordsByStatus(records ?? []), [records]);

  return (
    <section aria-labelledby="integrity-heading">
      <GlassCard className="flex flex-col gap-4">
        <h2 id="integrity-heading" className="text-lg font-semibold text-foreground">
          Integridade pública
        </h2>

        <QueryStateSection
          isLoading={isLoading}
          isError={isError}
          isEmpty={groups.length === 0}
          errorMessage="Não foi possível carregar os registros de integridade."
          emptyMessage="Nenhum registro de integridade encontrado."
        >
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <IntegrityStatusGroup
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
