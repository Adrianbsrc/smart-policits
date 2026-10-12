import Link from "next/link";
import { buildBreadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo";
import { JsonLdScript } from "./json-ld-script";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Trilha de navegação reutilizável. Puramente visual (recebe os itens já
 * prontos) e sempre emparelhada com o JSON-LD `BreadcrumbList` correspondente
 * — nenhuma página usa este componente ainda (arquitetura, não layout).
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <>
      <JsonLdScript data={buildBreadcrumbJsonLd(items)} />
      <nav aria-label="breadcrumb" className={cn("text-sm text-muted-foreground", className)}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {isLast ? (
                  <span aria-current="page" className="text-foreground">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="transition-colors hover:text-foreground">
                    {item.name}
                  </Link>
                )}
                {!isLast && (
                  <span aria-hidden="true" className="text-muted-foreground/60">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
