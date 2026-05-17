import { AuthGuard } from "@/components/auth/auth-guard";
import { QueryProvider } from "@/components/providers/query-provider";
import { Navbar } from "@/components/layout/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <QueryProvider>
        <Navbar />
        <main className="flex flex-1 flex-col">{children}</main>
      </QueryProvider>
    </AuthGuard>
  );
}
