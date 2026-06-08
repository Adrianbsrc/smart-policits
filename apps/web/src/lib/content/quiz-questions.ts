export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: "Prioridades",
    question: "Qual área você considera mais urgente para o Brasil investir agora?",
    options: [
      { value: "seguranca",      label: "Segurança pública e redução da violência" },
      { value: "saude",          label: "Sistema público de saúde (SUS)" },
      { value: "educacao",       label: "Educação básica e pública de qualidade" },
      { value: "economia",       label: "Geração de empregos e desenvolvimento econômico" },
      { value: "ambiente",       label: "Meio ambiente e sustentabilidade" },
      { value: "infraestrutura", label: "Infraestrutura (estradas, saneamento, energia)" },
    ],
  },
  {
    id: 2,
    category: "Economia",
    question: "Qual é sua visão sobre o papel do Estado na economia?",
    options: [
      { value: "mais_estado",  label: "Mais Estado: empresas públicas fortes e regulação intensa" },
      { value: "equilibrio",   label: "Equilíbrio entre público e privado" },
      { value: "menos_estado", label: "Menos Estado: privatizações e livre mercado" },
      { value: "neutro",       label: "Depende do setor estratégico" },
    ],
  },
  {
    id: 3,
    category: "Transparência",
    question: "O combate à corrupção é sua prioridade ao escolher um candidato?",
    options: [
      { value: "muito",      label: "Sim, é minha prioridade número 1" },
      { value: "importante", label: "É muito importante, mas não a única" },
      { value: "pouco",      label: "Há questões mais urgentes no momento" },
      { value: "nao",        label: "Não é determinante para meu voto" },
    ],
  },
  {
    id: 4,
    category: "Educação & Tecnologia",
    question: "Sobre investimento em educação e inovação, você acredita que:",
    options: [
      { value: "aumentar",    label: "Deve aumentar significativamente com mais recursos públicos" },
      { value: "manter",      label: "Os recursos atuais são suficientes; falta gestão eficiente" },
      { value: "privado",     label: "Deve incentivar mais o ensino privado e vouchers educacionais" },
      { value: "tecnologia",  label: "Foco em tecnologia educacional e formação técnica profissional" },
    ],
  },
  {
    id: 5,
    category: "Empreendedorismo",
    question: "Como você vê a liberdade econômica e o empreendedorismo?",
    options: [
      { value: "livre",     label: "Menos regulação, mais liberdade para empreender" },
      { value: "regulado",  label: "Regulação adequada protege trabalhadores e consumidores" },
      { value: "misto",     label: "Equilibrar incentivos ao empreendedorismo com proteção social" },
      { value: "publico",   label: "Foco em empresas públicas estratégicas e nacionais" },
    ],
  },
  {
    id: 6,
    category: "Meio Ambiente",
    question: "Como você avalia a relação entre desenvolvimento econômico e meio ambiente?",
    options: [
      { value: "muito_importante", label: "Meio ambiente é prioridade máxima — limitar crescimento se necessário" },
      { value: "equilibrio",       label: "Equilibrar crescimento econômico com responsabilidade ambiental" },
      { value: "crescimento",      label: "Crescimento econômico primeiro; tecnologia resolverá depois" },
      { value: "mercado",          label: "O mercado e a iniciativa privada devem liderar a agenda ambiental" },
    ],
  },
  {
    id: 7,
    category: "Saúde",
    question: "Sobre a saúde pública no Brasil, você acredita que:",
    options: [
      { value: "sus_universal", label: "O SUS deve ser fortalecido e ser a opção universal e gratuita" },
      { value: "misto",         label: "Sistema misto: SUS robusto com complementação privada regulada" },
      { value: "privado",       label: "Incentivar mais os planos privados com subsídios e desoneração" },
      { value: "reforma",       label: "Reforma estrutural completa, repensando o modelo inteiro" },
    ],
  },
  {
    id: 8,
    category: "Infraestrutura & Inovação",
    question: "Sobre infraestrutura e inovação tecnológica, sua visão é:",
    options: [
      { value: "publico",      label: "Investimento público intenso em infraestrutura e pesquisa" },
      { value: "concessoes",   label: "Concessões e privatizações são mais eficientes e rápidas" },
      { value: "tecnologia",   label: "Foco em digitalização, startups e inovação aberta" },
      { value: "equilibrio",   label: "Equilibrar infraestrutura básica com avanço tecnológico" },
    ],
  },
  {
    id: 9,
    category: "Direitos Sociais",
    question: "Sobre direitos trabalhistas, previdência e proteção social:",
    options: [
      { value: "ampliar",     label: "Ampliar direitos: mais proteção social e previdência robusta" },
      { value: "manter",      label: "Manter o que existe, com ajustes pontuais e fiscalização" },
      { value: "flexibilizar", label: "Flexibilizar: menos encargos trabalhistas para gerar mais empregos" },
      { value: "reformar",    label: "Reforma estrutural: repensar as bases do modelo social brasileiro" },
    ],
  },
  {
    id: 10,
    category: "Política Externa",
    question: "Qual deve ser a postura do Brasil nas relações internacionais?",
    options: [
      { value: "soberania",   label: "Soberania em primeiro lugar; menor dependência externa" },
      { value: "integracao",  label: "Integração regional e fortalecimento do Mercosul e da América do Sul" },
      { value: "global",      label: "Abertura global: mais acordos comerciais e investimento estrangeiro" },
      { value: "pragmatico",  label: "Pragmatismo: avaliar caso a caso conforme os interesses nacionais" },
    ],
  },
];
