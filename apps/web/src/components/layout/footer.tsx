import Link from "next/link";

const footerLinks = {
  produto: [
    { href: "/quiz", label: "Quiz Eleitoral" },
    { href: "/ranking", label: "Ranking de Políticos" },
    { href: "/cola-eleitoral", label: "Cola Eleitoral" },
    { href: "/blog", label: "Blog" },
  ],
  institucional: [
    { href: "/metodologia", label: "Metodologia" },
    { href: "/blog", label: "Imprensa" },
  ],
  legal: [
    { href: "/privacidade", label: "Privacidade" },
    { href: "/termos", label: "Termos de Uso" },
    { href: "/lgpd", label: "LGPD" },
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
            <Link href="/" className="flex items-center gap-2.5 text-foreground">
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
