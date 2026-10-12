"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizFinished } from "@/components/quiz/quiz-finished";
import { QUIZ_QUESTIONS } from "@/lib/content/quiz-questions";
import { Routes } from "@/routes";

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers]   = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);

  const question  = QUIZ_QUESTIONS[currentQuestion] ?? QUIZ_QUESTIONS[0]!;
  const total     = QUIZ_QUESTIONS.length;
  const answered  = Object.keys(answers).filter((k) => Number(k) <= currentQuestion + 1).length;
  const progress  = (answered / total) * 100;
  const current   = answers[currentQuestion + 1];

  function handleAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion + 1]: value }));
  }

  function handleNext() {
    if (currentQuestion < total - 1) {
      setCurrentQuestion((q) => q + 1);
    } else {
      const stringAnswers: Record<string, string> = {};
      for (const [k, v] of Object.entries(answers)) stringAnswers[String(k)] = v;
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
        onViewResult={() => router.push(Routes.quizResult())}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link href={Routes.home()} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <span className="text-sm text-muted-foreground">{currentQuestion + 1} de {total}</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={currentQuestion + 1}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="animate-in">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
          {question.category}
        </div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
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
              current === option.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-background hover:border-border-strong hover:bg-muted/30",
            )}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.value}
              checked={current === option.value}
              onChange={() => handleAnswer(option.value)}
              className="sr-only"
            />
            <div className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              current === option.value ? "border-primary bg-primary" : "border-border",
            )}>
              {current === option.value && (
                <div className="h-2 w-2 rounded-full bg-primary-foreground" />
              )}
            </div>
            <span className={cn(
              "text-sm leading-relaxed transition-colors",
              current === option.value ? "font-medium text-foreground" : "text-muted-foreground",
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
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={!current}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {currentQuestion === total - 1 ? "Ver resultado" : "Próxima"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="text-center">
        <button onClick={handleNext} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          Pular pergunta
        </button>
      </div>
    </div>
  );
}
