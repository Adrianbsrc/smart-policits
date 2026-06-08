-- Migration: add candidate_number to politicians + ScoreType enum to scores
-- candidateNumber: número na urna para cola eleitoral
-- ScoreType: mock (sem dados reais) | partial (dados parciais API) | real (dados completos)

-- ── ScoreType enum ───────────────────────────────────────────────────────────

CREATE TYPE "ScoreType" AS ENUM ('mock', 'partial', 'real');

-- ── Politician: candidate_number + ficha_limpa_ineligible ────────────────────

ALTER TABLE "politicians" ADD COLUMN "candidate_number" INTEGER;
ALTER TABLE "politicians" ADD COLUMN "ficha_limpa_ineligible" BOOLEAN NOT NULL DEFAULT false;

-- ── Score: score_type ────────────────────────────────────────────────────────

ALTER TABLE "scores" ADD COLUMN "score_type" "ScoreType" NOT NULL DEFAULT 'mock';

-- Backfill: políticos da API já têm dados reais parciais (presença, proposições)
UPDATE "scores" s
SET "score_type" = 'partial'
FROM "politicians" p
WHERE s."politician_id" = p."id"
  AND p."data_source" = 'api';
