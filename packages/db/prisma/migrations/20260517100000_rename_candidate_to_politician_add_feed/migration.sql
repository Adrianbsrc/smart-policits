-- Migration: rename candidates → politicians, add feed_items
-- Manual SQL to preserve data while renaming tables and columns

-- 1. Create FeedItemType enum
CREATE TYPE "FeedItemType" AS ENUM ('politician_spotlight', 'news', 'law_update', 'poll');

-- 2. Rename candidates table to politicians
ALTER TABLE "candidates" RENAME TO "politicians";

-- 3. Rename candidate_id → politician_id in scores (column rename, no data loss)
ALTER TABLE "scores" RENAME COLUMN "candidate_id" TO "politician_id";

-- 4. Rename candidate_id → politician_id in follows
ALTER TABLE "follows" RENAME COLUMN "candidate_id" TO "politician_id";

-- 5. Rename candidate_id → politician_id in alerts
ALTER TABLE "alerts" RENAME COLUMN "candidate_id" TO "politician_id";

-- 6. Drop old FK constraints (names from Prisma's original naming)
ALTER TABLE "scores"  DROP CONSTRAINT IF EXISTS "scores_candidate_id_fkey";
ALTER TABLE "follows" DROP CONSTRAINT IF EXISTS "follows_candidate_id_fkey";
ALTER TABLE "alerts"  DROP CONSTRAINT IF EXISTS "alerts_candidate_id_fkey";
ALTER TABLE "politicians" DROP CONSTRAINT IF EXISTS "candidates_party_id_fkey";

-- 7. Drop old unique constraints that reference old column names
ALTER TABLE "scores"  DROP CONSTRAINT IF EXISTS "scores_candidate_id_key";
ALTER TABLE "follows" DROP CONSTRAINT IF EXISTS "follows_user_id_candidate_id_key";
ALTER TABLE "politicians" DROP CONSTRAINT IF EXISTS "candidates_tse_id_key";
ALTER TABLE "politicians" DROP CONSTRAINT IF EXISTS "candidates_slug_key";
ALTER TABLE "politicians" DROP CONSTRAINT IF EXISTS "candidates_pkey";

-- 8. Drop old indexes
DROP INDEX IF EXISTS "candidates_office_state_idx";
DROP INDEX IF EXISTS "candidates_slug_idx";

-- 9. Recreate primary key on politicians
ALTER TABLE "politicians" ADD CONSTRAINT "politicians_pkey" PRIMARY KEY ("id");

-- 10. Recreate unique constraints
ALTER TABLE "politicians" ADD CONSTRAINT "politicians_tse_id_key" UNIQUE ("tse_id");
ALTER TABLE "politicians" ADD CONSTRAINT "politicians_slug_key" UNIQUE ("slug");
ALTER TABLE "scores"  ADD CONSTRAINT "scores_politician_id_key" UNIQUE ("politician_id");
ALTER TABLE "follows" ADD CONSTRAINT "follows_user_id_politician_id_key" UNIQUE ("user_id", "politician_id");

-- 11. Recreate FK constraints with new names
ALTER TABLE "politicians" ADD CONSTRAINT "politicians_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE SET DEFAULT;

ALTER TABLE "scores" ADD CONSTRAINT "scores_politician_id_fkey"
  FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE;

ALTER TABLE "follows" ADD CONSTRAINT "follows_politician_id_fkey"
  FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE;

ALTER TABLE "alerts" ADD CONSTRAINT "alerts_politician_id_fkey"
  FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE SET NULL;

-- 12. Recreate indexes on politicians
CREATE INDEX "politicians_office_state_idx" ON "politicians"("office", "state");
CREATE INDEX "politicians_slug_idx" ON "politicians"("slug");

-- 13. Create feed_items table
CREATE TABLE "feed_items" (
    "id"           TEXT NOT NULL,
    "type"         "FeedItemType" NOT NULL,
    "title"        TEXT NOT NULL,
    "summary"      TEXT,
    "image_url"    TEXT,
    "cta_label"    TEXT,
    "cta_url"      TEXT,
    "metadata"     JSONB NOT NULL DEFAULT '{}',
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at"   TIMESTAMP(3),
    "active"       BOOLEAN NOT NULL DEFAULT true,
    "politician_id" TEXT,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_items_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_politician_id_fkey"
  FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE SET NULL;

CREATE INDEX "feed_items_type_active_published_at_idx" ON "feed_items"("type", "active", "published_at");
CREATE INDEX "feed_items_politician_id_idx" ON "feed_items"("politician_id");
