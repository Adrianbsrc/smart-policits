"use client";

import { QueryStateSection } from "@/components/ui/query-state-section";
import { useEvidences } from "../../hooks";

export interface EvidenceListDebugProps {
  slug: string;
}

/**
 * Tela de debug — apenas lista as evidências de um perfil, sem layout
 * elaborado. Existe para validar o fluxo completo da feature (Query → API →
 * DTO → Mapper → Domain Model → ViewModel → Component) enquanto não há
 * nenhuma tela "de produto" para Evidence.
 */
export function EvidenceListDebug({ slug }: EvidenceListDebugProps) {
  const { data: evidences, isLoading, isError } = useEvidences(slug);

  return (
    <section className="p-4">
      <h1 className="mb-4 text-lg font-semibold">Evidence — debug ({slug})</h1>

      <QueryStateSection
        isLoading={isLoading}
        isError={isError}
        isEmpty={(evidences ?? []).length === 0}
        errorMessage="Não foi possível carregar as evidências."
        emptyMessage="Nenhuma evidência registrada para este perfil."
      >
        <ul className="flex flex-col gap-3">
          {(evidences ?? []).map((evidence) => (
            <li key={evidence.id} className="border border-border p-3 text-sm">
              <p className="font-medium">
                {evidence.title} — {evidence.dateLabel}
              </p>
              <p className="text-muted-foreground">{evidence.summary}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Categorias: {evidence.categoryLabels.join(", ") || "—"} · Impacto: {evidence.impactLabel} ·
                Confiabilidade: {evidence.reliabilityLabel} · Fonte: {evidence.primarySourceLabel}
              </p>
            </li>
          ))}
        </ul>
      </QueryStateSection>
    </section>
  );
}
