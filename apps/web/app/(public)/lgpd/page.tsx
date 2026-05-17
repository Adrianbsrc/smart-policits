import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LGPD — Smart Politics",
  description: "Informações sobre o tratamento de dados pessoais em conformidade com a Lei Geral de Proteção de Dados.",
};

export default function LgpdPage() {
  return (
    <LegalPage
      tag="LGPD"
      title="Tratamento de Dados Pessoais"
      lastUpdate="Abril de 2026"
    >
      <Section title="Base legal e finalidade">
        <p>
          A Smart Politics trata dados pessoais com base nas seguintes hipóteses previstas na Lei nº 13.709/2018 (LGPD):
          <strong> consentimento</strong> do titular, <strong>legítimo interesse</strong> da plataforma e <strong>execução de contrato</strong> quando aplicável.
        </p>
        <p className="mt-3">
          Os dados são coletados com a finalidade específica de possibilitar o funcionamento da plataforma, personalizar os resultados do quiz eleitoral e enviar comunicações de interesse ao usuário.
        </p>
      </Section>

      <Section title="Dados coletados">
        <ul className="flex flex-col gap-2">
          {[
            "Nome e endereço de e-mail (ao criar conta)",
            "Respostas do quiz eleitoral (anônimas por padrão)",
            "Dados de navegação coletados via cookies analíticos",
            "Preferências de tema e configurações de interface",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground-muted" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Direitos do titular">
        <p>Você tem os seguintes direitos em relação aos seus dados:</p>
        <ul className="mt-3 flex flex-col gap-2">
          {[
            "Acesso — consultar quais dados mantemos sobre você",
            "Correção — solicitar a atualização de dados incorretos",
            "Exclusão — solicitar a remoção de seus dados pessoais",
            "Portabilidade — obter seus dados em formato estruturado",
            "Revogação do consentimento — a qualquer momento",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          Para exercer esses direitos, entre em contato: <strong>privacidade@smartpolitics.com.br</strong>
        </p>
      </Section>

      <Section title="Retenção de dados">
        <p>
          Seus dados são mantidos pelo período necessário para prestação do serviço e conforme exigido pela legislação aplicável. Após o encerramento da conta, os dados são deletados em até 30 dias, salvo obrigação legal de retenção.
        </p>
      </Section>

      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/privacidade" className="text-primary hover:text-primary/80">Política de Privacidade →</Link>
        <Link href="/termos" className="text-primary hover:text-primary/80">Termos de Uso →</Link>
      </div>
    </LegalPage>
  );
}

function LegalPage({ tag, title, lastUpdate, children }: { tag: string; title: string; lastUpdate: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">{tag}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Última atualização: {lastUpdate}</p>
      </div>
      <div className="flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}
