import Link from "next/link";
import { Routes } from "@/routes";

const footerLinks = {
  produto: [
    { href: Routes.quiz(), label: "Quiz Eleitoral" },
    { href: Routes.ranking(), label: "Ranking de Políticos" },
    { href: Routes.colaEleitoral(), label: "Cola Eleitoral" },
    { href: Routes.blog(), label: "Blog" },
  ],
  institucional: [
    { href: Routes.methodology(), label: "Metodologia" },
    { href: Routes.blog(), label: "Imprensa" },
  ],
  legal: [
    { href: Routes.privacidade(), label: "Privacidade" },
    { href: Routes.termos(), label: "Termos de Uso" },
    { href: Routes.lgpd(), label: "LGPD" },
  ],
} as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background-subtle">
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-2">
            <Link href={Routes.home()} className="flex items-center gap-2.5 text-foreground">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-primary to-secondary">
                <div className="absolute inset-[4px] rounded-[5px] bg-background" />
                <span className="relative text-[13px] font-extrabold text-primary">★</span>
              </div>
              <span className="font-display font-bold tracking-tight">Smart Politics</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              Plataforma independente para ajudar você a votar com consciência. Dados públicos, sem viés político.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Plataforma independente, sem vínculo com partidos políticos.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Produto</p>
            <ul className="flex flex-col gap-2">
              {footerLinks.produto.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Institucional</p>
            <ul className="flex flex-col gap-2">
              {footerLinks.institucional.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal</p>
            <ul className="flex flex-col gap-2">
              {footerLinks.legal.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} Smart Politics. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Dados: TSE · Câmara · Senado · CGU
          </p>
        </div>
      </div>
    </footer>
  );
}
