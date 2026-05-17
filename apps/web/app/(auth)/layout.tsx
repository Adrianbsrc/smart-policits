import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { QueryProvider } from "@/components/providers/query-provider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-2.5 text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">Smart Politics</span>
          </Link>
        </header>
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
