import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { LegalSection } from "@/components/legal/legal-section";

export const metadata: Metadata = {
  title: "Política de Privacidade — Smart Politics",
  description: "Como coletamos, usamos e protegemos suas informações pessoais na plataforma Smart Politics.",
};

export default function PrivacidadePage() {
  return (
    <LegalPage tag="Legal" title="Política de Privacidade" lastUpdate="Abril de 2026">
      <LegalSection title="Quem somos">
        <p>
          A Smart Politics é uma plataforma digital independente que oferece ferramentas de análise política
          baseadas em dados públicos. Não temos vínculos com partidos políticos, candidatos ou organizações
          governamentais.
        </p>
      </LegalSection>

      <LegalSection title="Informações que coletamos">
        <p><strong className="text-foreground">Informações fornecidas voluntariamente:</strong></p>
        <ul className="mt-2 flex flex-col gap-1">
          {["Nome e e-mail (ao criar conta)", "Respostas do quiz eleitoral", "Preferências e configurações de perfil"].map((i) => (
            <li key={i} className="ml-4 list-disc">{i}</li>
          ))}
        </ul>
        <p className="mt-3"><strong className="text-foreground">Informações coletadas automaticamente:</strong></p>
        <ul className="mt-2 flex flex-col gap-1">
          {["Dados de acesso (IP, data/hora, página visitada)", "Tipo de navegador e dispositivo", "Cookies de funcionamento essenciais"].map((i) => (
            <li key={i} className="ml-4 list-disc">{i}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="Como usamos suas informações">
        <ul className="flex flex-col gap-2">
          {[
            "Para fornecer e personalizar os serviços da plataforma",
            "Para calcular seu alinhamento com candidatos (quiz eleitoral)",
            "Para enviar comunicações sobre atualizações da plataforma (com seu consentimento)",
            "Para análises estatísticas agregadas e anônimas de uso da plataforma",
          ].map((i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              {i}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="Compartilhamento de dados">
        <p>
          <strong className="text-foreground">Não vendemos seus dados.</strong> Podemos compartilhar informações com:
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {[
            "Provedores de infraestrutura técnica (ex: Supabase, Vercel) — sujeitos a contratos de proteção",
            "Autoridades competentes, quando exigido por lei",
          ].map((i) => (
            <li key={i} className="ml-4 list-disc">{i}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="Segurança">
        <p>
          Utilizamos criptografia TLS em trânsito e armazenamos senhas com hash bcrypt. Acesso a dados pessoais
          é restrito a colaboradores autorizados e registrado em logs de auditoria.
        </p>
      </LegalSection>

      <LegalSection title="Seus direitos">
        <p>
          Você pode acessar, corrigir ou excluir seus dados pessoais a qualquer momento nas configurações da sua
          conta ou entrando em contato via{" "}
          <strong className="text-foreground">privacidade@smartpolitics.com.br</strong>. Também pode solicitar
          portabilidade dos seus dados em formato JSON.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          Usamos apenas cookies essenciais para funcionamento da plataforma (sessão de autenticação). Não
          utilizamos cookies de rastreamento de terceiros ou publicidade comportamental.
        </p>
      </LegalSection>

      <div className="mt-4 flex gap-4 text-sm">
        <Link href="/lgpd" className="text-primary hover:text-primary/80">LGPD →</Link>
        <Link href="/termos" className="text-primary hover:text-primary/80">Termos de Uso →</Link>
      </div>
    </LegalPage>
  );
}
