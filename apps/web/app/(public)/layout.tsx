import { QueryProvider } from "@/components/providers/query-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </QueryProvider>
  );
}
