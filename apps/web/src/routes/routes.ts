/**
 * Camada centralizada de rotas públicas do Smart Politics.
 *
 * Toda URL do app deve nascer de uma função aqui — nunca de uma string
 * espalhada em um componente. Isso mantém as URLs (hoje em português) trocáveis
 * em um único lugar — inclusive para internacionalização futura, já que os
 * segmentos ficam isolados em `SEGMENT` em vez de inline em cada função.
 *
 * Todo parâmetro dinâmico passa por `encodeURIComponent` antes de virar
 * segmento de URL — defesa simples contra slugs com caracteres inesperados.
 */

const SEGMENT = {
  perfis: "perfis",
  perfilLegado: "perfil",
  candidatoLegado: "candidato",
  comparar: "comparar",
  quiz: "quiz",
  resultado: "resultado",
  ranking: "ranking",
  metodologia: "metodologia",
  colaEleitoral: "cola-eleitoral",
  feed: "feed",
  blog: "blog",
  login: "login",
  cadastro: "cadastro",
  esqueciSenha: "esqueci-senha",
  dashboard: "dashboard",
  favoritos: "favoritos",
  configuracoes: "configuracoes",
  termos: "termos",
  privacidade: "privacidade",
  lgpd: "lgpd",
  debug: "debug",
  evidencias: "evidencias",
} as const;

/**
 * Segmento de URL por cargo (`Office`, ver packages/core). Preparado para
 * `/presidentes`, `/governadores`, `/senadores`, `/deputados` mesmo sem
 * página própria ainda — quando a listagem por cargo existir, a URL já
 * está definida aqui e não precisa ser inventada em outro lugar.
 */
export const OFFICE_SEGMENT = {
  president: "presidentes",
  governor: "governadores",
  senator: "senadores",
  federal_deputy: "deputados",
} as const;

export type RoutableOffice = keyof typeof OFFICE_SEGMENT;

function seg(value: string): string {
  return encodeURIComponent(value);
}

export const Routes = {
  home(): string {
    return "/";
  },

  // ─── Perfis (domínio PoliticalProfile, RFC-004) ───────────────────────────
  /** Perfil no domínio novo e independente de Politician (docs/SPECs/political-profile.md). */
  profile(slug: string): string {
    return `/${SEGMENT.perfis}/${seg(slug)}`;
  },

  // ─── Comparação ─────────────────────────────────────────────────────────
  compare(): string {
    return `/${SEGMENT.comparar}`;
  },
  /** Comparação com o primeiro slot pré-preenchido — comportamento atual da tela de comparação. */
  compareStart(slug: string): string {
    return `/${SEGMENT.comparar}?a=${seg(slug)}`;
  },
  /**
   * URL canônica de comparação entre dois perfis (docs/SPECs/comparison.md#compartilhamento).
   * Ainda sem página própria — reservada para quando a comparação por slug existir.
   */
  compareProfiles(slugA: string, slugB: string): string {
    return `/${SEGMENT.comparar}/${seg(slugA)}/${seg(slugB)}`;
  },

  // ─── Quiz ───────────────────────────────────────────────────────────────
  quiz(): string {
    return `/${SEGMENT.quiz}`;
  },
  quizResult(): string {
    return `/${SEGMENT.resultado}`;
  },

  // ─── Descoberta ─────────────────────────────────────────────────────────
  ranking(): string {
    return `/${SEGMENT.ranking}`;
  },
  methodology(): string {
    return `/${SEGMENT.metodologia}`;
  },
  colaEleitoral(): string {
    return `/${SEGMENT.colaEleitoral}`;
  },
  feed(): string {
    return `/${SEGMENT.feed}`;
  },

  // ─── Blog ───────────────────────────────────────────────────────────────
  blog(): string {
    return `/${SEGMENT.blog}`;
  },
  blogPost(slug: string): string {
    return `/${SEGMENT.blog}/${seg(slug)}`;
  },

  // ─── Cargos (preparado para expansão, sem página própria ainda) ─────────
  byOffice(office: RoutableOffice): string {
    return `/${OFFICE_SEGMENT[office]}`;
  },
  presidents(): string {
    return Routes.byOffice("president");
  },
  governors(): string {
    return Routes.byOffice("governor");
  },
  senators(): string {
    return Routes.byOffice("senator");
  },
  deputies(): string {
    return Routes.byOffice("federal_deputy");
  },

  // ─── Auth ───────────────────────────────────────────────────────────────
  login(): string {
    return `/${SEGMENT.login}`;
  },
  cadastro(): string {
    return `/${SEGMENT.cadastro}`;
  },
  esqueciSenha(): string {
    return `/${SEGMENT.esqueciSenha}`;
  },

  // ─── Área autenticada ─────────────────────────────────────────────────────
  dashboard(): string {
    return `/${SEGMENT.dashboard}`;
  },
  favoritos(): string {
    return `/${SEGMENT.favoritos}`;
  },
  configuracoes(): string {
    return `/${SEGMENT.configuracoes}`;
  },

  // ─── Institucional ──────────────────────────────────────────────────────
  termos(): string {
    return `/${SEGMENT.termos}`;
  },
  privacidade(): string {
    return `/${SEGMENT.privacidade}`;
  },
  lgpd(): string {
    return `/${SEGMENT.lgpd}`;
  },

  // ─── Debug (ferramentas internas, não indexáveis) ──────────────────────────
  /** Lista crua de Evidences de um perfil — apenas para validar a feature Evidence. */
  evidenceDebug(slug: string): string {
    return `/${SEGMENT.debug}/${SEGMENT.evidencias}/${seg(slug)}`;
  },

  // ─── Domínio legado (Politician/Party — coexiste com PoliticalProfile) ────
  /** Perfil no domínio legado (Politician). Ver CLAUDE.md#domínio-politicalprofile. */
  legacyPoliticianProfile(slug: string): string {
    return `/${SEGMENT.perfilLegado}/${seg(slug)}`;
  },
  /** Rota legada mantida como redirect permanente para legacyPoliticianProfile. */
  legacyCandidateRedirect(slug: string): string {
    return `/${SEGMENT.candidatoLegado}/${seg(slug)}`;
  },
} as const;
