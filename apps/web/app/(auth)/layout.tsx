import Link from "next/link";
import { QueryProvider } from "@/components/providers/query-provider";

// ─── LogoMark (inline, auth layout não usa Navbar) ───────────────────────────

function LogoMark() {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-primary to-secondary">
      <div className="absolute inset-[4px] rounded-[5px] bg-background" />
      <span className="relative text-[13px] font-extrabold text-primary">★</span>
    </div>
  );
}

// ─── AuthLayout ───────────────────────────────────────────────────────────────

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="relative flex min-h-screen flex-col">
        {/* Fundo Liquid */}
        <div className="page-gradient pointer-events-none fixed inset-0 -z-10 opacity-80" aria-hidden />
        <div className="dot-pattern pointer-events-none fixed inset-0 -z-10 opacity-25" aria-hidden />

        {/* Header minimal */}
        <header className="flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-2.5 text-foreground">
            <LogoMark />
            <span className="font-display font-bold tracking-tight">Smart Politics</span>
          </Link>
        </header>

        {/* Auth card centered */}
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          {children}
        </main>

        <footer className="flex h-12 items-center justify-center px-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Smart Politics. Plataforma independente e imparcial.
          </p>
        </footer>
      </div>
    </QueryProvider>
  );
}
