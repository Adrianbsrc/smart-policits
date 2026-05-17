/**
 * Centralized UI strings — prepared for future i18n.
 * Import `UI` and reference e.g. `UI.nav.quiz` instead of hardcoding text.
 */
export const UI = {
  brand: {
    name: "Smart Politics",
    tagline: "Vote com consciência.",
    description:
      "Plataforma imparcial para ajudar você a decidir seu voto com base em dados públicos, histórico político e alinhamento de valores.",
  },

  nav: {
    ranking: "Ranking",
    quiz: "Quiz",
    metodologia: "Metodologia",
    blog: "Blog",
    login: "Entrar",
    signup: "Fazer Quiz",
    dashboard: "Dashboard",
    favorites: "Favoritos",
    settings: "Configurações",
    logout: "Sair",
  },

  hero: {
    badge: "Dados atualizados em tempo real",
    title: "Descubra quais candidatos combinam com seus valores.",
    subtitle:
      "Compare candidatos com base em dados públicos, histórico político e prioridades que importam para você.",
    ctaPrimary: "Fazer Quiz Eleitoral",
    ctaSecondary: "Ver Ranking",
    disclaimer: "Gratuito · Imparcial · Dados do TSE e fontes oficiais",
  },

  howItWorks: {
    title: "Como funciona",
    subtitle: "Em menos de 5 minutos você descobre quais candidatos mais se alinham com seus valores.",
    steps: [
      { step: "01", title: "Responda ao quiz", description: "15 perguntas sobre suas prioridades: saúde, educação, segurança, economia e transparência." },
      { step: "02", title: "Veja seu alinhamento", description: "Calculamos quais candidatos mais se alinham com os seus valores em cada tema." },
      { step: "03", title: "Monte sua cola eleitoral", description: "Salve seus candidatos favoritos e compartilhe com amigos e família." },
    ],
  },

  cta: {
    primary: "Fazer o Quiz Eleitoral",
    secondary: "Ver Ranking",
    signUp: "Criar conta grátis",
  },

  states: {
    loading: "Carregando...",
    empty: "Nenhum resultado encontrado.",
    error: "Algo deu errado.",
    retry: "Tentar novamente",
    noData: "Sem dados disponíveis",
  },

  candidateCard: {
    score: "Nota geral",
    follow: "Seguir",
    following: "Seguindo",
    seeProfile: "Ver perfil",
  },

  quiz: {
    title: "Quiz Eleitoral",
    subtitle: "Responda as perguntas abaixo para descobrir quais candidatos combinam com você.",
    progress: (current: number, total: number) => `Pergunta ${current} de ${total}`,
    next: "Próxima",
    prev: "Anterior",
    finish: "Ver resultado",
    skip: "Pular",
  },

  auth: {
    login: {
      title: "Bem-vindo de volta",
      subtitle: "Entre com sua conta para continuar.",
      submit: "Entrar",
      forgotPassword: "Esqueceu a senha?",
      noAccount: "Não tem conta?",
      createAccount: "Criar conta grátis",
    },
    signup: {
      title: "Crie sua conta",
      subtitle: "Gratuito. Sem cartão. Sem viés.",
      submit: "Criar conta",
      hasAccount: "Já tem conta?",
      login: "Entrar",
      terms: "Ao criar sua conta, você concorda com os nossos",
      termsLink: "Termos de Uso",
      and: "e",
      privacyLink: "Política de Privacidade",
    },
    forgotPassword: {
      title: "Recuperar senha",
      subtitle: "Enviaremos um link para redefinir sua senha.",
      submit: "Enviar link",
      back: "Voltar ao login",
    },
  },

  footer: {
    product: "Produto",
    company: "Empresa",
    legal: "Legal",
    copyright: (year: number) => `© ${year} Smart Politics. Todos os direitos reservados.`,
    disclaimer: "Plataforma independente, sem vínculo com partidos políticos.",
  },
} as const;
