import type { ReactNode } from "react";
import { SkeletonCard } from "./skeleton";

export interface QueryStateSectionProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage: string;
  emptyMessage: string;
  children: ReactNode;
}

/**
 * Bloco loading/error/empty/content — extraído porque Timeline, Promises,
 * Indicators e Integrity repetiam exatamente os mesmos 4 ramos condicionais.
 * Qualquer feature nova que busca dados e agrupa em cards deve reaproveitar
 * este componente em vez de duplicar o markup.
 */
export function QueryStateSection({
  isLoading,
  isError,
  isEmpty,
  errorMessage,
  emptyMessage,
  children,
}: QueryStateSectionProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-muted-foreground">{errorMessage}</p>;
  }

  if (isEmpty) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return <>{children}</>;
}
