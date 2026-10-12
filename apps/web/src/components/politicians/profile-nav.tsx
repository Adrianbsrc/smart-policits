import Link from "next/link";
import { ArrowLeft, GitCompare } from "lucide-react";
import { Routes } from "@/routes";

interface ProfileNavProps {
  slug: string;
}

export function ProfileNav({ slug }: ProfileNavProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <Link
        href={Routes.ranking()}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao ranking
      </Link>
      <Link
        href={Routes.compareStart(slug)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <GitCompare className="h-3.5 w-3.5" />
        Comparar perfis
      </Link>
    </div>
  );
}
