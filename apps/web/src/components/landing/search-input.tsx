"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Routes } from "@/routes";

/**
 * Placeholder elegante (docs/SPECs/home.md#pesquisa): navega para o Ranking
 * com o termo já na URL — o mesmo alvo que `buildWebsiteJsonLd` já declara
 * como `SearchAction`. O Ranking ainda não lê esse parâmetro para pré-filtrar
 * (gap documentado na SPEC); nenhuma API nova foi criada para isto.
 */
export function SearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`${Routes.ranking()}?search=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Nome do político…"
        startAdornment={<Search className="h-4 w-4" aria-hidden />}
        aria-label="Pesquisar um político pelo nome"
        className="flex-1"
      />
      <Button type="submit" size="lg">
        Buscar
      </Button>
    </form>
  );
}
