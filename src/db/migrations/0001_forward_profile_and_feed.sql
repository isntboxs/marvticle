ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banner" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "pronouns" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "location" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "education" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "work" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "published_at" timestamp;--> statement-breakpoint
UPDATE "posts" SET "published_at" = "created_at" WHERE "status" = 'PUBLISHED' AND "published_at" IS NULL;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "posts" ADD CONSTRAINT "posts_published_at_matches_status" CHECK (("posts"."status" = 'PUBLISHED' AND "posts"."published_at" IS NOT NULL) OR ("posts"."status" <> 'PUBLISHED' AND "posts"."published_at" IS NULL));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_feed_idx" ON "posts" USING btree ("status","published_at" DESC NULLS LAST,"id" DESC NULLS LAST);
