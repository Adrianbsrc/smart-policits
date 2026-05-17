import type { Metadata } from "next";
import { QuizResultClient } from "@/components/quiz/quiz-result-client";

const OG_URL = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://smartpolitics.com.br";

export const metadata: Metadata = {
  title: "Seu Resultado — Quiz Eleitoral | Smart Politics",
  description: "Descubra quais candidatos mais combinam com seus valores políticos. Faça o quiz e veja seu perfil eleitoral.",
  openGraph: {
    title: "Meu perfil eleitoral no Smart Politics",
    description: "Fiz o quiz político e descobri meus candidatos mais alinhados com meus valores. Descubra os seus!",
    type: "website",
    url: `${OG_URL}/resultado`,
    siteName: "Smart Politics",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meu perfil eleitoral no Smart Politics",
    description: "Fiz o quiz político e descobri meus candidatos mais alinhados. Descubra os seus!",
  },
};

export default function ResultadoPage() {
  return <QuizResultClient />;
}
