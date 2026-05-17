"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizOption {
  value: string;
  label: string;
}

interface Question {
  id: number;
  category: string;
  question: string;
  options: QuizOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Prioridades",
    question: "Qual área você considera mais urgente para o Brasil investir agora?",
    options: [
      { value: "seguranca", label: "Segurança pública e redução da violência" },
      { value: "saude", label: "Sistema público de saúde (SUS)" },
      { value: "educacao", label: "Educação básica e pública de qualidade" },
      { value: "economia", label: "Geração de empregos e desenvolvimento econômico" },
      { value: "ambiente", label: "Meio ambiente e sustentabilidade" },
      { value: "infraestrutura", label: "Infraestrutura (estradas, saneamento, energia)" },
    ],
  },
  {
    id: 2,
    category: "Economia",
    question: "Qual é sua visão sobre o papel do Estado na economia?",
    options: [
      { value: "mais_estado", label: "Mais Estado: empresas públicas fortes e regulação intensa" },
      { value: "equilibrio", label: "Equilíbrio entre público e privado" },
      { value: "menos_estado", label: "Menos Estado: privatizações e livre mercado" },
      { value: "neutro", label: "Depende do setor estratégico" },
    ],
  },
  {
    id: 3,
    category: "Transparência",
    question: "O combate à corrupção é sua prioridade ao escolher um candidato?",
    options: [
      { value: "muito", label: "Sim, é minha prioridade número 1" },
      { value: "importante", label: "É muito importante, mas não a única" },
      { value: "pouco", label: "Há questões mais urgentes no momento" },
      { value: "nao", label: "Não é determinante para meu voto" },
    ],
  },
  {
    id: 4,
    category: "Educação & Tecnologia",
    question: "Sobre investimento em educação e inovação, você acredita que:",
    options: [
      { value: "aumentar", label: "Deve aumentar significativamente com mais recursos públicos" },
      { value: "manter", label: "Os recursos atuais são suficientes; falta gestão eficiente" },
      { value: "privado", label: "Deve incentivar mais o ensino privado e vouchers educacionais" },
      { value: "tecnologia", label: "Foco em tecnologia educacional e formação técnica profissional" },
    ],
  },
  {
    id: 5,
    category: "Empreendedorismo",
    question: "Como você vê a liberdade econômica e o empreendedorismo?",
    options: [
      { value: "livre", label: "Menos regulação, mais liberdade para empreender" },
      { value: "regulado", label: "Regulação adequada protege trabalhadores e consumidores" },
      { value: "misto", label: "Equilibrar incentivos ao empreendedorismo com proteção social" },
      { value: "publico", label: "Foco em empresas públicas estratégicas e nacionais" },
    ],
  },
  {
    id: 6,
    category: "Meio Ambiente",
    question: "Como você avalia a relação entre desenvolvimento econômico e meio ambiente?",
    options: [
      { value: "muito_importante", label: "Meio ambiente é prioridade máxima — limitar crescimento se necessário" },
      { value: "equilibrio", label: "Equilibrar crescimento econômico com responsabilidade ambiental" },
      { value: "crescimento", label: "Crescimento econômico primeiro; tecnologia resolverá depois" },
      { value: "mercado", label: "O mercado e a iniciativa privada devem liderar a agenda ambiental" },
    ],
  },
  {
    id: 7,
    category: "Saúde",
    question: "Sobre a saúde pública no Brasil, você acredita que:",
    options: [
      { value: "sus_universal", label: "O SUS deve ser fortalecido e ser a opção universal e gratuita" },
      { value: "misto", label: "Sistema misto: SUS robusto com complementação privada regulada" },
      { value: "privado", label: "Incentivar mais os planos privados com subsídios e desoneração" },
      { value: "reforma", label: "Reforma estrutural completa, repensando o modelo inteiro" },
    ],
  },
  {
    id: 8,
    category: "Infraestrutura & Inovação",
    question: "Sobre infraestrutura e inovação tecnológica, sua visão é:",
    options: [
      { value: "publico", label: "Investimento público intenso em infraestrutura e pesquisa" },
      { value: "concessoes", label: "Concessões e privatizações são mais eficientes e rápidas" },
      { value: "tecnologia", label: "Foco em digitalização, startups e inovação aberta" },
      { value: "equilibrio", label: "Equilibrar infraestrutura básica com avanço tecnológico" },
    ],
  },
  {
    id: 9,
    category: "Direitos Sociais",
    question: "Sobre direitos trabalhistas, previdência e proteção social:",
    options: [
      { value: "ampliar", label: "Ampliar direitos: mais proteção social e previdência robusta" },
      { value: "manter", label: "Manter o que existe, com ajustes pontuais e fiscalização" },
      { value: "flexibilizar", label: "Flexibilizar: menos encargos trabalhistas para gerar mais empregos" },
      { value: "reformar", label: "Reforma estrutural: repensar as bases do modelo social brasileiro" },
    ],
  },
  {
    id: 10,
    category: "Política Externa",
    question: "Qual deve ser a postura do Brasil nas relações internacionais?",
    options: [
      { value: "soberania", label: "Soberania em primeiro lugar; menor dependência externa" },
      { value: "integracao", label: "Integração regional e fortalecimento do Mercosul e da América do Sul" },
      { value: "global", label: "Abertura global: mais acordos comerciais e investimento estrangeiro" },
      { value: "pragmatico", label: "Pragmatismo: avaliar caso a caso conforme os interesses nacionais" },
    ],
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);

  const question = QUESTIONS[currentQuestion] ?? QUESTIONS[0]!;
  const total = QUESTIONS.length;
  const answeredUpToCurrent = Object.keys(answers).filter((k) => Number(k) <= currentQuestion + 1).length;
  const progress = (answeredUpToCurrent / total) * 100;
  const currentAnswer = answers[currentQuestion + 1];

  function handleAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion + 1]: value }));
  }

  function handleNext() {
    if (currentQuestion < total - 1) {
      setCurrentQuestion((q) => q + 1);
    } else {
      const stringAnswers: Record<string, string> = {};
      for (const [k, v] of Object.entries(answers)) {
        stringAnswers[String(k)] = v;
      }
      sessionStorage.setItem("quiz_answers", JSON.stringify(stringAnswers));
      setFinished(true);
    }
  }

  function handlePrev() {
    if (currentQuestion > 0) setCurrentQuestion((q) => q - 1);
  }

  if (finished) {
    return (
      <QuizFinished
        answersCount={Object.keys(answers).length}
        total={total}
        onViewResult={() => router.push("/resultado")}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} de {total}
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentQuestion + 1}
            aria-valuemin={0}
            aria-valuemax={total}
          />
        </div>
      </div>

      {/* Question */}
      <div className="animate-in">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
          {question.category}
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {question.question}
        </h1>
      </div>

      {/* Options */}
      <fieldset className="animate-in flex flex-col gap-3" style={{ animationDelay: "50ms" }}>
        <legend className="sr-only">Escolha uma opção</legend>
        {question.options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-150",
              currentAnswer === option.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-background hover:border-border-strong hover:bg-muted/30",
            )}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.value}
              checked={currentAnswer === option.value}
              onChange={() => handleAnswer(option.value)}
              className="sr-only"
            />
            <div className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              currentAnswer === option.value ? "border-primary bg-primary" : "border-border",
            )}>
              {currentAnswer === option.value && (
                <div className="h-2 w-2 rounded-full bg-primary-foreground" />
              )}
            </div>
            <span className={cn(
              "text-sm leading-relaxed transition-colors",
              currentAnswer === option.value ? "font-medium text-foreground" : "text-muted-foreground",
            )}>
              {option.label}
            </span>
          </label>
        ))}
      </fieldset>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </button>

        <button
          onClick={handleNext}
          disabled={!currentAnswer}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentQuestion === total - 1 ? "Ver resultado" : "Próxima"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={handleNext}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Pular pergunta
        </button>
      </div>
    </div>
  );
}

function QuizFinished({
  answersCount,
  total,
  onViewResult,
}: {
  answersCount: number;
  total: number;
  onViewResult: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
        <CheckCircle className="h-8 w-8 text-success" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quiz concluído!</h1>
        <p className="mt-2 text-muted-foreground">
          Você respondeu {answersCount} de {total} perguntas. Calculando seu alinhamento político...
        </p>
      </div>
      <button
        onClick={onViewResult}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
      >
        Ver meu resultado
        <ArrowRight className="h-4 w-4" />
      </button>
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        Voltar ao início
      </Link>
    </div>
  );
}
