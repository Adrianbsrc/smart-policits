-- Baseline migration — full schema as of 2026-05-19
-- Replaces broken migration chain (init → add_score_dimensions →
-- add_score_structural_fields → rename_candidate_to_politician_add_feed).
-- The prior migrations diverged from the real DB because several tables
-- (alerts, politician_facts) and columns were applied via db push.
--
-- To mark this as already applied on an existing database run:
--   pnpm --filter @smart-politics/db exec prisma migrate resolve --applied 20260519000000_baseline

-- ── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'moderator');

CREATE TYPE "Office" AS ENUM (
  'president', 'governor', 'senator', 'federal_deputy', 'state_deputy'
);

CREATE TYPE "PartyIdeology" AS ENUM (
  'far_left', 'left', 'center_left', 'center', 'center_right', 'right', 'far_right'
);

CREATE TYPE "DataSource" AS ENUM ('api', 'manual', 'hybrid');

CREATE TYPE "FactType" AS ENUM (
  'court_case', 'conviction', 'controversy', 'achievement', 'statement', 'position'
);

CREATE TYPE "AlertType" AS ENUM ('score_change', 'news');

CREATE TYPE "FeedItemType" AS ENUM (
  'politician_spotlight', 'news', 'law_update', 'poll', 'generic'
);

-- ── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE "users" (
    "id"          TEXT        NOT NULL,
    "supabase_id" TEXT        NOT NULL,
    "email"       TEXT        NOT NULL,
    "name"        TEXT,
    "avatar_url"  TEXT,
    "role"        "UserRole"  NOT NULL DEFAULT 'user',
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "parties" (
    "id"         TEXT            NOT NULL,
    "name"       TEXT            NOT NULL,
    "acronym"    TEXT            NOT NULL,
    "color_hex"  TEXT            NOT NULL,
    "logo_url"   TEXT,
    "ideology"   "PartyIdeology" NOT NULL,
    "created_at" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3)    NOT NULL,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "politicians" (
    "id"               TEXT         NOT NULL,
    "tse_id"           TEXT,
    "name"             TEXT         NOT NULL,
    "slug"             TEXT         NOT NULL,
    "office"           "Office"     NOT NULL,
    "state"            TEXT,
    "photo_url"        TEXT,
    "bio"              TEXT,
    "party_id"         TEXT,
    "data_source"      "DataSource" NOT NULL DEFAULT 'api',
    "is_pre_candidate" BOOLEAN      NOT NULL DEFAULT false,
    "candidate_year"   INTEGER,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "politicians_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "politician_facts" (
    "id"            TEXT         NOT NULL,
    "politician_id" TEXT         NOT NULL,
    "type"          "FactType"   NOT NULL,
    "title"         TEXT         NOT NULL,
    "description"   TEXT         NOT NULL,
    "source"        TEXT,
    "source_url"    TEXT,
    "date"          TIMESTAMP(3),
    "verified_at"   TIMESTAMP(3),
    "verified_by"   TEXT,
    "sentiment"     INTEGER,
    "impact"        INTEGER,
    "tags"          TEXT[]       NOT NULL,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "politician_facts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scores" (
    "id"                   TEXT             NOT NULL,
    "politician_id"        TEXT             NOT NULL,
    "overall"              DOUBLE PRECISION NOT NULL,
    -- thematic dimensions
    "education"            DOUBLE PRECISION NOT NULL DEFAULT 0,
    "health"               DOUBLE PRECISION NOT NULL DEFAULT 0,
    "security"             DOUBLE PRECISION NOT NULL DEFAULT 0,
    "economy"              DOUBLE PRECISION NOT NULL DEFAULT 0,
    "environment"          DOUBLE PRECISION NOT NULL DEFAULT 0,
    "infrastructure"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "technology"           DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agriculture"          DOUBLE PRECISION NOT NULL DEFAULT 0,
    "international"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    "culture"              DOUBLE PRECISION NOT NULL DEFAULT 0,
    "social_rights"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    "entrepreneurship"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    -- structural pillars
    "transparency"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "constitutional"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fiscal"               DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activity"             DOUBLE PRECISION NOT NULL DEFAULT 0,
    -- integrity
    "integrity_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "penalties"            JSONB            NOT NULL DEFAULT '[]',
    "breakdown"            JSONB,
    "score_version"        TEXT             NOT NULL DEFAULT '2.0.0',
    "updated_at"           TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "follows" (
    "id"            TEXT         NOT NULL,
    "user_id"       TEXT         NOT NULL,
    "politician_id" TEXT         NOT NULL,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quiz_results" (
    "id"           TEXT         NOT NULL,
    "user_id"      TEXT         NOT NULL,
    "answers"      JSONB        NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "alerts" (
    "id"            TEXT          NOT NULL,
    "user_id"       TEXT          NOT NULL,
    "type"          "AlertType"   NOT NULL,
    "title"         TEXT          NOT NULL,
    "body"          TEXT          NOT NULL,
    "politician_id" TEXT,
    "read"          BOOLEAN       NOT NULL DEFAULT false,
    "created_at"    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feed_items" (
    "id"            TEXT           NOT NULL,
    "type"          "FeedItemType" NOT NULL,
    "title"         TEXT           NOT NULL,
    "summary"       TEXT,
    "image_url"     TEXT,
    "cta_label"     TEXT,
    "cta_url"       TEXT,
    "metadata"      JSONB          NOT NULL DEFAULT '{}',
    "published_at"  TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at"    TIMESTAMP(3),
    "active"        BOOLEAN        NOT NULL DEFAULT true,
    "politician_id" TEXT,
    "created_at"    TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3)   NOT NULL,

    CONSTRAINT "feed_items_pkey" PRIMARY KEY ("id")
);

-- ── Unique indexes ────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX "users_supabase_id_key"               ON "users"("supabase_id");
CREATE UNIQUE INDEX "users_email_key"                     ON "users"("email");
CREATE UNIQUE INDEX "parties_name_key"                    ON "parties"("name");
CREATE UNIQUE INDEX "parties_acronym_key"                 ON "parties"("acronym");
CREATE UNIQUE INDEX "politicians_tse_id_key"              ON "politicians"("tse_id");
CREATE UNIQUE INDEX "politicians_slug_key"                ON "politicians"("slug");
CREATE UNIQUE INDEX "scores_politician_id_key"            ON "scores"("politician_id");
CREATE UNIQUE INDEX "follows_user_id_politician_id_key"   ON "follows"("user_id", "politician_id");

-- ── Regular indexes ───────────────────────────────────────────────────────────

CREATE INDEX "politicians_office_state_idx"                        ON "politicians"("office", "state");
CREATE INDEX "politicians_slug_idx"                                ON "politicians"("slug");
CREATE INDEX "politicians_is_pre_candidate_candidate_year_idx"     ON "politicians"("is_pre_candidate", "candidate_year");
CREATE INDEX "politician_facts_politician_id_type_idx"             ON "politician_facts"("politician_id", "type");
CREATE INDEX "quiz_results_user_id_idx"                            ON "quiz_results"("user_id");
CREATE INDEX "alerts_user_id_read_idx"                             ON "alerts"("user_id", "read");
CREATE INDEX "feed_items_type_active_published_at_idx"             ON "feed_items"("type", "active", "published_at");
CREATE INDEX "feed_items_politician_id_idx"                        ON "feed_items"("politician_id");

-- ── Foreign keys ──────────────────────────────────────────────────────────────

ALTER TABLE "politicians" ADD CONSTRAINT "politicians_party_id_fkey"
    FOREIGN KEY ("party_id") REFERENCES "parties"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "politician_facts" ADD CONSTRAINT "politician_facts_politician_id_fkey"
    FOREIGN KEY ("politician_id") REFERENCES "politicians"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "scores" ADD CONSTRAINT "scores_politician_id_fkey"
    FOREIGN KEY ("politician_id") REFERENCES "politicians"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "follows" ADD CONSTRAINT "follows_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "follows" ADD CONSTRAINT "follows_politician_id_fkey"
    FOREIGN KEY ("politician_id") REFERENCES "politicians"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "alerts" ADD CONSTRAINT "alerts_politician_id_fkey"
    FOREIGN KEY ("politician_id") REFERENCES "politicians"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_politician_id_fkey"
    FOREIGN KEY ("politician_id") REFERENCES "politicians"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
