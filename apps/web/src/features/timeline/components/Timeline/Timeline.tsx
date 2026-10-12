"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { QueryStateSection } from "@/components/ui/query-state-section";
import { useExpandableSelection } from "@/hooks/use-expandable-selection";
import { useTimeline } from "../../hooks";
import type { TimelineCategory } from "../../models";
import { getTimelineFilterOptions, groupTimelineEventsByYear } from "../../view-models";
import { TimelineFilters } from "../TimelineFilters";
import { TimelineYearGroup } from "../TimelineYearGroup";

export interface TimelineProps {
  slug: string;
  /** Rótulo da seção — páginas diferentes podem contextualizar (ex.: "Linha do tempo política"). */
  title?: string;
}

/**
 * Orquestrador da Timeline: busca (useTimeline, já devolve View Models —
 * GET /profiles/:slug/timeline, construído a partir de Evidence no backend
 * via @smart-politics/core), filtra e agrupa por ano inteiramente em
 * memória — filtro e expandir/recolher nunca disparam nova chamada à API.
 */
export function Timeline({ slug, title = "Linha do tempo" }: TimelineProps) {
  const { data: events, isLoading, isError } = useTimeline(slug);
  const [selectedCategory, setSelectedCategory] = useState<TimelineCategory | "all">("all");
  const { expandedIds, toggle, setAll } = useExpandableSelection();

  const filterOptions = useMemo(() => getTimelineFilterOptions(), []);

  useEffect(() => {
    if (!events) return;
    setAll(events.filter((event) => event.initiallyExpanded).map((event) => event.id));
  }, [events, setAll]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (selectedCategory === "all") return events;
    return events.filter((event) => event.category === selectedCategory);
  }, [events, selectedCategory]);

  const groups = useMemo(() => groupTimelineEventsByYear(filteredEvents), [filteredEvents]);

  return (
    <section aria-labelledby="timeline-heading">
      <GlassCard className="flex flex-col gap-4">
        <h2 id="timeline-heading" className="text-lg font-semibold text-foreground">
          {title}
        </h2>

        <TimelineFilters options={filterOptions} selected={selectedCategory} onSelect={setSelectedCategory} />

        <QueryStateSection
          isLoading={isLoading}
          isError={isError}
          isEmpty={groups.length === 0}
          errorMessage="Não foi possível carregar a linha do tempo."
          emptyMessage="Nenhum acontecimento registrado para este filtro."
        >
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <TimelineYearGroup
                key={group.year}
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
