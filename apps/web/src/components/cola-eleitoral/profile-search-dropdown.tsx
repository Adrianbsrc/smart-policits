"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { candidatesService } from "@/lib/api/services";
import { useDebounce } from "@/hooks/use-debounce";

interface ProfileSearchDropdownProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  officeFilter: string;
  placeholder: string;
}

export function ProfileSearchDropdown({
  id, value, onChange, officeFilter, placeholder,
}: ProfileSearchDropdownProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen]   = useState(false);
  const containerRef      = useRef<HTMLDivElement>(null);
  const debouncedQuery    = useDebounce(query, 300);

  const { data, isFetching } = useQuery({
    queryKey: ["cola-search", debouncedQuery, officeFilter],
    queryFn: () => candidatesService.list({ search: debouncedQuery, office: officeFilter, limit: 6 }),
    enabled:   debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
  });

  const suggestions = data?.data ?? [];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleInputChange(v: string) {
    setQuery(v);
    onChange(v);
    setOpen(true);
  }

  function handleSelect(name: string, acronym: string | undefined) {
    const label = acronym ? `${name} (${acronym})` : name;
    setQuery(label);
    onChange(label);
    setOpen(false);
  }

  function handleClear() {
    setQuery("");
    onChange("");
    setOpen(false);
  }

  const showDropdown = open && debouncedQuery.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <Search className="pointer-events-none absolute left-0 h-4 w-4 shrink-0 text-muted-foreground/60" />
      <input
        id={id}
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => debouncedQuery.trim().length >= 2 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="flex-1 bg-transparent pl-6 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
      {isFetching && (
        <div className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      )}
      {query && !isFetching && (
        <button onClick={handleClear} aria-label="Limpar campo" className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-background shadow-md">
          {suggestions.map((c) => (
            <button
              key={c.id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(c.name, c.party?.acronym); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.party?.acronym ?? "—"}{c.state ? ` · ${c.state}` : ""}
                </p>
              </div>
              {c.party && (
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: c.party.colorHex }}>
                  {c.party.acronym}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {showDropdown && suggestions.length === 0 && !isFetching && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-background px-4 py-3 text-xs text-muted-foreground shadow-md">
          Nenhum perfil encontrado. Você pode digitar manualmente.
        </div>
      )}
    </div>
  );
}
