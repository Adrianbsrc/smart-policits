import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso — Smart Politics",
  description: "Leia os termos e condições de uso da plataforma Smart Politics.",
};

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Termos de Uso</h1>
        <p className="mt-3 text-sm text-muted-foreground">Última atualização: Abril de 2026</p>
      </div>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
        <Section title="Aceitação dos termos">
          <p>
            Ao acessar ou usar a plataforma Smart Politics, você concorda com estes Termos de Uso. Se não concordar com algum item, não use a plataforma.
          </p>
        </Section>

        <Section title="Descrição do serviço">
          <p>
            A Smart Politics é uma plataforma educacional e informativa que agrega dados públicos sobre candidatos políticos para auxiliar cidadãos na tomada de decisão eleitoral. Não fazemos indicações de voto — apenas apresentamos dados para que você decida.
          </p>
        </Section>

        <Section title="Uso permitido">
          <ul className="flex flex-col gap-2">
            {[
              "Uso pessoal e educacional da plataforma e suas ferramentas",
              "Compartilhamento de links e resultados do quiz",
              "Incorporação de dados e visualizações com devida atribuição",
            ].map(i => <li key={i} className="flex items-start gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-success"/>{i}</li>)}
          </ul>
        </Section>

        <Section title="Uso proibido">
          <ul className="flex flex-col gap-2">
            {[
              "Scraping automatizado ou coleta em massa de dados sem autorização prévia",
              "Uso dos dados para fins de propaganda eleitoral paga ou impulsionada",
              "Deturpação ou manipulação dos dados apresentados",
              "Criação de serviços derivados sem licença expressa da Smart Politics",
            ].map(i => <li key={i} className="flex items-start gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-destructive"/>{i}</li>)}
          </ul>
        </Section>

        <Section title="Precisão dos dados">
          <p>
            Os dados são provenientes de fontes públicas e podem conter imprecisões ou estar desatualizados. A Smart Politics não garante a precisão absoluta das informações e não se responsabiliza por decisões tomadas com base exclusivamente nelas. Sempre consulte as fontes primárias.
          </p>
        </Section>

        <Section title="Isenção de responsabilidade política">
          <p>
            A Smart Politics é uma plataforma apartidária e imparcial. Não endossamos, apoiamos ou atacamos qualquer candidato, partido ou posicionamento político. Os scores são calculados algoritmicamente com base em dados públicos verificáveis.
          </p>
        </Section>

        <Section title="Propriedade intelectual">
          <p>
            A plataforma, seu código e design são de propriedade da Smart Politics, licenciados sob MIT para os componentes open-source. Os dados apresentados são públicos e de propriedade dos respectivos órgãos governamentais.
          </p>
        </Section>

        <Section title="Alterações nos termos">
          <p>
            Podemos atualizar estes termos periodicamente. Usuários cadastrados serão notificados por e-mail sobre mudanças significativas. O uso continuado da plataforma após a notificação constitui aceitação dos novos termos.
          </p>
        </Section>

        <Section title="Contato">
          <p>
            Dúvidas sobre estes termos: <strong className="text-foreground">legal@smartpolitics.com.br</strong>
          </p>
        </Section>

        <div className="flex gap-4">
          <Link href="/privacidade" className="text-primary hover:text-primary/80">Política de Privacidade →</Link>
          <Link href="/lgpd" className="text-primary hover:text-primary/80">LGPD →</Link>
        </div>
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
