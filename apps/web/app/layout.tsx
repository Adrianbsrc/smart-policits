import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smartpolitics.com.br";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Smart Politics — Vote com consciência",
    template: "%s | Smart Politics",
  },
  description:
    "Plataforma imparcial para ajudar você a decidir seu voto com base em dados públicos, histórico político e alinhamento de valores.",
  keywords: [
    "eleições", "candidatos", "voto consciente", "política", "brasil",
    "quiz eleitoral", "ranking candidatos", "dados eleitorais", "TSE",
    "transparência política", "histórico político",
  ],
  authors: [{ name: "Smart Politics", url: BASE_URL }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Smart Politics",
    title: "Smart Politics — Vote com consciência",
    description: "Descubra quais candidatos mais se alinham com os seus valores.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Politics — Vote com consciência",
    description: "Descubra quais candidatos mais se alinham com os seus valores.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Smart Politics",
  url: BASE_URL,
  description: "Plataforma imparcial para ajudar você a decidir seu voto com base em dados públicos.",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/ranking?search={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
