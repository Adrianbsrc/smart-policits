"use client";

import { useCallback, useState } from "react";

/**
 * Estado de "quais ids estão expandidos" — extraído porque Timeline,
 * Promises, Indicators e Integrity implementavam o mesmo Set<string> +
 * toggle de forma idêntica e independente. Qualquer feature nova com
 * cards expansíveis deve reaproveitar este hook em vez de duplicar.
 */
export function useExpandableSelection(initial: Iterable<string> = []) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(initial));

  const toggle = useCallback((id: string) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setAll = useCallback((ids: Iterable<string>) => {
    setExpandedIds(new Set(ids));
  }, []);

  return { expandedIds, toggle, setAll };
}
