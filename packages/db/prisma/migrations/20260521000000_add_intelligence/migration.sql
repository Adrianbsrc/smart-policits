-- CreateEnum
CREATE TYPE "PoliticianStatus" AS ENUM ('pre_candidate', 'candidate', 'elected', 'in_mandate', 'former', 'inactive');

-- AlterTable: adiciona campos de status de mandato ao modelo Politician
ALTER TABLE "politicians"
  ADD COLUMN "status" "PoliticianStatus" NOT NULL DEFAULT 'in_mandate',
  ADD COLUMN "mandate_start" TIMESTAMP(3),
  ADD COLUMN "mandate_end" TIMESTAMP(3);

-- CreateTable: armazenamento de interpretações da camada de inteligência
CREATE TABLE "interpretations" (
    "id" TEXT NOT NULL,
    "input_hash" TEXT NOT NULL,
    "input_type" TEXT NOT NULL,
    "input_data" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "provider_id" TEXT NOT NULL,
    "model_used" TEXT,
    "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interpretations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interpretations_input_hash_key" ON "interpretations"("input_hash");

-- CreateIndex
CREATE INDEX "interpretations_input_type_created_at_idx" ON "interpretations"("input_type", "created_at");

-- CreateIndex
CREATE INDEX "interpretations_provider_id_idx" ON "interpretations"("provider_id");
