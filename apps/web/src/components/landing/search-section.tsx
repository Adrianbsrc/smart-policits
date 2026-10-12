import { Search } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SearchInput } from "./search-input";

/**
 * "Pesquisar um político" (docs/SPECs/home.md) — atalho para quem já chegou
 * com um nome em mente, entre "Por que confiar" e "Ranking". Client boundary
 * mínima: só o input/submit é interativo (SearchInput), o resto é RSC.
 */
export function SearchSection() {
  return (
    <section className="relative py-16" aria-labelledby="search-heading">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <GlassCard className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-8 text-center sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary/15">
            <Search className="h-6 w-6 text-primary" aria-hidden />
          </div>

          <div>
            <h2 id="search-heading" className="font-display text-[1.6rem] font-bold tracking-tight text-foreground">
              Já sabe quem procurar?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Busque um político pelo nome e veja o perfil completo, com histórico e nota de transparência.
            </p>
          </div>

          <SearchInput />
        </GlassCard>
      </div>
    </section>
  );
}
