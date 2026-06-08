-- AlterTable: Add mandate_count field to politicians
-- mandate_count = número de mandatos exercidos pelo político
-- Usado para filtros: estreante (1), reeleito (>1), veterano (>=3)
ALTER TABLE "politicians" ADD COLUMN "mandate_count" INTEGER;
