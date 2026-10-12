-- PoliticalProfile domain (V1) — docs/SPECs/political-profile.md
-- Entidades novas e independentes de Politician/Party (não renomeia, não migra dados).
--
-- Filiação partidária é modelada via PoliticalAffiliation (histórico completo).
-- PoliticalProfile não tem FK direta de partido: o partido atual é a
-- PoliticalAffiliation com is_current = true (regra aplicada na camada de
-- service, não há constraint de unicidade parcial nesta migration).

-- ── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE "PoliticalProfileStatus" AS ENUM (
  'pre_candidate', 'candidate', 'elected', 'in_mandate', 'former', 'inactive'
);

CREATE TYPE "PoliticalOfficeType" AS ENUM (
  'president', 'governor', 'mayor', 'senator', 'federal_deputy', 'state_deputy'
);

CREATE TYPE "PoliticalOfficeScope" AS ENUM ('national', 'state', 'municipal');

CREATE TYPE "ElectoralResult" AS ENUM ('elected', 'runner_up', 'not_elected');

-- ── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE "political_parties" (
    "id"      TEXT NOT NULL,
    "name"    TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "number"  INTEGER,
    "logo"    TEXT,

    CONSTRAINT "political_parties_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "political_offices" (
    "id"         TEXT                    NOT NULL,
    "type"       "PoliticalOfficeType"   NOT NULL,
    "name"       TEXT                    NOT NULL,
    "scope"      "PoliticalOfficeScope"  NOT NULL,
    "term_years" INTEGER                 NOT NULL,

    CONSTRAINT "political_offices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "political_profiles" (
    "id"                TEXT                      NOT NULL,
    "slug"              TEXT                      NOT NULL,
    "full_name"         TEXT                      NOT NULL,
    "display_name"      TEXT                      NOT NULL,
    "biography"         TEXT,
    "photo"             TEXT,
    "birth_date"        TIMESTAMP(3),
    "birth_place"       TEXT,
    "current_office_id" TEXT,
    "status"            "PoliticalProfileStatus"  NOT NULL DEFAULT 'candidate',
    "is_candidate"      BOOLEAN                   NOT NULL DEFAULT true,
    "is_incumbent"      BOOLEAN                   NOT NULL DEFAULT false,
    "created_at"        TIMESTAMP(3)              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3)              NOT NULL,

    CONSTRAINT "political_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "political_affiliations" (
    "id"         TEXT         NOT NULL,
    "profile_id" TEXT         NOT NULL,
    "party_id"   TEXT         NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date"   TIMESTAMP(3),
    "is_current" BOOLEAN      NOT NULL DEFAULT false,
    "reason"     TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "political_affiliations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mandates" (
    "id"               TEXT               NOT NULL,
    "profile_id"       TEXT               NOT NULL,
    "office_id"        TEXT               NOT NULL,
    "start_date"       TIMESTAMP(3)       NOT NULL,
    "end_date"         TIMESTAMP(3),
    "reelected"        BOOLEAN            NOT NULL DEFAULT false,
    "description"      TEXT,
    "election_year"    INTEGER,
    "election_round"   INTEGER,
    "votes"            INTEGER,
    "electoral_result" "ElectoralResult",
    "start_reason"     TEXT,
    "end_reason"       TEXT,
    "vice_profile_id"  TEXT,
    "created_at"       TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3)       NOT NULL,

    CONSTRAINT "mandates_pkey" PRIMARY KEY ("id")
);

-- ── Unique indexes ────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX "political_parties_name_key"    ON "political_parties"("name");
CREATE UNIQUE INDEX "political_parties_acronym_key" ON "political_parties"("acronym");
CREATE UNIQUE INDEX "political_offices_type_key"    ON "political_offices"("type");
CREATE UNIQUE INDEX "political_profiles_slug_key"   ON "political_profiles"("slug");

-- ── Regular indexes ───────────────────────────────────────────────────────────

CREATE INDEX "political_profiles_slug_idx"              ON "political_profiles"("slug");
CREATE INDEX "political_profiles_status_idx"             ON "political_profiles"("status");
CREATE INDEX "political_profiles_current_office_id_idx"  ON "political_profiles"("current_office_id");
CREATE INDEX "political_profiles_display_name_idx"       ON "political_profiles"("display_name");
CREATE INDEX "political_affiliations_profile_id_idx"     ON "political_affiliations"("profile_id");
CREATE INDEX "political_affiliations_party_id_idx"       ON "political_affiliations"("party_id");
CREATE INDEX "mandates_profile_id_idx"                    ON "mandates"("profile_id");
CREATE INDEX "mandates_office_id_idx"                     ON "mandates"("office_id");
CREATE INDEX "mandates_election_year_idx"                 ON "mandates"("election_year");

-- ── Foreign keys ──────────────────────────────────────────────────────────────

ALTER TABLE "political_profiles" ADD CONSTRAINT "political_profiles_current_office_id_fkey"
    FOREIGN KEY ("current_office_id") REFERENCES "political_offices"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "political_affiliations" ADD CONSTRAINT "political_affiliations_profile_id_fkey"
    FOREIGN KEY ("profile_id") REFERENCES "political_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "political_affiliations" ADD CONSTRAINT "political_affiliations_party_id_fkey"
    FOREIGN KEY ("party_id") REFERENCES "political_parties"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "mandates" ADD CONSTRAINT "mandates_profile_id_fkey"
    FOREIGN KEY ("profile_id") REFERENCES "political_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mandates" ADD CONSTRAINT "mandates_office_id_fkey"
    FOREIGN KEY ("office_id") REFERENCES "political_offices"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "mandates" ADD CONSTRAINT "mandates_vice_profile_id_fkey"
    FOREIGN KEY ("vice_profile_id") REFERENCES "political_profiles"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
