-- Migration: add ficha_limpa_ineligible to politicians
-- Armazena declaração explícita de inelegibilidade pelo TSE (ficha suja confirmada).
-- Permite badge visual no frontend sem depender de score.integrityMultiplier.

ALTER TABLE "politicians" ADD COLUMN IF NOT EXISTS "ficha_limpa_ineligible" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: Bolsonaro (pres-002) declarado inelegível pelo TSE até 2030
UPDATE "politicians"
SET "ficha_limpa_ineligible" = true
WHERE "tse_id" = 'pres-002';
