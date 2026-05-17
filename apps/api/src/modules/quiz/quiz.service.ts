import { Injectable } from "@nestjs/common";

import type { CandidateResult } from "../candidates/candidates.repository";
import { CandidatesService } from "../candidates/candidates.service";
import { QuizRepository } from "./quiz.repository";

export interface DimensionWeights {
  education: number;
  health: number;
  security: number;
  economy: number;
  transparency: number;
  environment: number;
  infrastructure: number;
  technology: number;
  agriculture: number;
  international: number;
  culture: number;
  socialRights: number;
  entrepreneurship: number;
}

export interface MatchResult {
  candidateId: string;
  name: string;
  slug: string;
  office: string;
  state: string | null;
  party: { name: string; acronym: string; colorHex: string } | null;
  score: number;
  matchPercent: number;
}

interface QuizResultPayload {
  answers: Record<string, string>;
  weights: DimensionWeights;
  matches: MatchResult[];
}

function computeWeights(answers: Record<string, string>): DimensionWeights {
  const w: DimensionWeights = {
    education: 1.0, health: 1.0, security: 1.0, economy: 1.0, transparency: 1.0,
    environment: 1.0, infrastructure: 1.0, technology: 1.0, agriculture: 1.0,
    international: 1.0, culture: 1.0, socialRights: 1.0, entrepreneurship: 1.0,
  };

  // Q1 — priority area: +50% to the chosen dimension
  const priorityMap: Partial<Record<string, keyof DimensionWeights>> = {
    seguranca: "security",
    saude: "health",
    educacao: "education",
    economia: "economy",
    ambiente: "environment",
    infraestrutura: "infrastructure",
  };
  const q1dim = priorityMap[answers["1"] ?? ""];
  if (q1dim) w[q1dim] *= 1.5;

  // Q2 — role of state in economy
  if (answers["2"] === "mais_estado") {
    w.economy *= 0.6; w.socialRights *= 1.2; w.entrepreneurship *= 0.7;
  } else if (answers["2"] === "menos_estado") {
    w.economy *= 1.4; w.entrepreneurship *= 1.3; w.socialRights *= 0.7;
  }

  // Q3 — transparency / anti-corruption priority
  const transpMap: Record<string, number> = { muito: 1.5, importante: 1.2, pouco: 0.8, nao: 0.5 };
  w.transparency *= transpMap[answers["3"] ?? ""] ?? 1.0;

  // Q4 — education & technology investment
  if (answers["4"] === "aumentar") w.education *= 1.5;
  else if (answers["4"] === "privado") w.education *= 0.8;
  else if (answers["4"] === "tecnologia") { w.education *= 1.2; w.technology *= 1.3; }

  // Q5 — economic freedom & entrepreneurship
  if (answers["5"] === "livre") {
    w.economy *= 1.3; w.entrepreneurship *= 1.4;
  } else if (answers["5"] === "regulado") {
    w.economy *= 0.8; w.socialRights *= 1.2;
  } else if (answers["5"] === "publico") {
    w.economy *= 0.6; w.socialRights *= 1.5; w.entrepreneurship *= 0.7;
  }

  // Q6 — environment vs economic growth
  if (answers["6"] === "muito_importante") {
    w.environment *= 1.5; w.agriculture *= 0.9;
  } else if (answers["6"] === "crescimento") {
    w.environment *= 0.7; w.economy *= 1.1;
  } else if (answers["6"] === "mercado") {
    w.environment *= 0.8; w.entrepreneurship *= 1.1;
  }

  // Q7 — health system model
  if (answers["7"] === "sus_universal") {
    w.health *= 1.5; w.socialRights *= 1.1;
  } else if (answers["7"] === "privado") {
    w.health *= 0.9; w.entrepreneurship *= 1.1;
  } else if (answers["7"] === "reforma") {
    w.health *= 1.2;
  }

  // Q8 — infrastructure & innovation
  if (answers["8"] === "publico") {
    w.infrastructure *= 1.4; w.technology *= 1.0;
  } else if (answers["8"] === "concessoes") {
    w.infrastructure *= 1.2; w.entrepreneurship *= 1.2;
  } else if (answers["8"] === "tecnologia") {
    w.technology *= 1.5; w.infrastructure *= 0.9;
  } else if (answers["8"] === "equilibrio") {
    w.infrastructure *= 1.2; w.technology *= 1.2;
  }

  // Q9 — social rights & labor
  if (answers["9"] === "ampliar") {
    w.socialRights *= 1.5; w.economy *= 0.9;
  } else if (answers["9"] === "flexibilizar") {
    w.socialRights *= 0.7; w.entrepreneurship *= 1.3; w.economy *= 1.1;
  } else if (answers["9"] === "reformar") {
    w.socialRights *= 1.1; w.economy *= 1.1;
  }

  // Q10 — foreign policy
  if (answers["10"] === "integracao") {
    w.international *= 1.3;
  } else if (answers["10"] === "global") {
    w.international *= 1.5; w.economy *= 1.1;
  } else if (answers["10"] === "soberania") {
    w.international *= 0.7;
  }

  return w;
}

function computeMatchPercent(candidate: CandidateResult, weights: DimensionWeights): number {
  const { score } = candidate;
  if (!score) return 0;

  const dims = [
    "education", "health", "security", "economy", "transparency",
    "environment", "infrastructure", "technology", "agriculture",
    "international", "culture", "socialRights", "entrepreneurship",
  ] as const;

  let weightSum = 0;
  let weighted = 0;

  for (const dim of dims) {
    const w = weights[dim];
    const s = score[dim as keyof typeof score];
    if (typeof s === "number") {
      weightSum += w;
      weighted += w * s;
    }
  }

  if (weightSum === 0) return 0;
  return Math.round((weighted / weightSum / 10) * 100);
}

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly candidatesService: CandidatesService,
  ) {}

  async submitQuiz(userId: string | null, answers: Record<string, string>) {
    const weights = computeWeights(answers);
    const candidates = await this.candidatesService.findAllWithScores();

    const matches: MatchResult[] = candidates
      .map((c) => ({
        candidateId: c.id,
        name: c.name,
        slug: c.slug,
        office: c.office,
        state: c.state,
        party: c.party
          ? { name: c.party.name, acronym: c.party.acronym, colorHex: c.party.colorHex }
          : null,
        score: c.score?.overall ?? 0,
        matchPercent: computeMatchPercent(c, weights),
      }))
      .sort((a, b) => b.matchPercent - a.matchPercent);

    const topMatches = matches.slice(0, 10);

    if (userId) {
      const payload: QuizResultPayload = { answers, weights, matches: topMatches };
      const record = await this.quizRepository.create({
        userId,
        answers: payload as unknown as Parameters<typeof this.quizRepository.create>[0]["answers"],
      });
      return { id: record.id, completedAt: record.completedAt, weights, matches: topMatches };
    }

    return { id: null, completedAt: new Date(), weights, matches: topMatches };
  }

  async getLatestResult(userId: string) {
    const record = await this.quizRepository.findLatestByUser(userId);
    if (!record) return null;

    const payload = record.answers as unknown as QuizResultPayload;
    return {
      id: record.id,
      completedAt: record.completedAt,
      weights: payload.weights,
      matches: payload.matches,
    };
  }

  async deleteLatestResult(userId: string): Promise<void> {
    await this.quizRepository.deleteLatestByUser(userId);
  }

  async getFreshMatches(userId: string) {
    const record = await this.quizRepository.findLatestByUser(userId);
    if (!record) return null;

    const payload = record.answers as unknown as QuizResultPayload;
    const candidates = await this.candidatesService.findAllWithScores();

    const matches: MatchResult[] = candidates
      .map((c) => ({
        candidateId: c.id,
        name: c.name,
        slug: c.slug,
        office: c.office,
        state: c.state,
        party: c.party
          ? { name: c.party.name, acronym: c.party.acronym, colorHex: c.party.colorHex }
          : null,
        score: c.score?.overall ?? 0,
        matchPercent: computeMatchPercent(c, payload.weights),
      }))
      .sort((a, b) => b.matchPercent - a.matchPercent);

    return {
      id: record.id,
      completedAt: record.completedAt,
      weights: payload.weights,
      matches: matches.slice(0, 10),
    };
  }
}
