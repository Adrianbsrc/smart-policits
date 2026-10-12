import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Routes } from "@/routes";

interface QuizFinishedProps {
  answersCount: number;
  total: number;
  onViewResult: () => void;
}

export function QuizFinished({ answersCount, total, onViewResult }: QuizFinishedProps) {
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
      <Link href={Routes.home()} className="text-sm text-muted-foreground hover:text-foreground">
        Voltar ao início
      </Link>
    </div>
  );
}
