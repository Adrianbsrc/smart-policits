import type { Metadata } from "next";
import { ConfiguracoesClient } from "@/components/configuracoes/configuracoes-client";

export const metadata: Metadata = {
  title: "Configurações — Smart Politics",
  description: "Gerencie sua conta e preferências na plataforma Smart Politics.",
};

export default function ConfiguracoesPage() {
  return <ConfiguracoesClient />;
}
