-- Add structural score fields: pillars, integrity multiplier, penalties, breakdown, version
ALTER TABLE "scores" ADD COLUMN "constitutional"       DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "scores" ADD COLUMN "fiscal"               DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "scores" ADD COLUMN "activity"             DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "scores" ADD COLUMN "integrity_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0;
ALTER TABLE "scores" ADD COLUMN "penalties"            JSONB            NOT NULL DEFAULT '[]';
ALTER TABLE "scores" ADD COLUMN "breakdown"            JSONB;
ALTER TABLE "scores" ADD COLUMN "score_version"        TEXT             NOT NULL DEFAULT '2.0.0';
