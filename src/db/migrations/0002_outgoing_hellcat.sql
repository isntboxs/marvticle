DROP INDEX "posts_status_idx";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
UPDATE "posts" SET "published_at" = "created_at" WHERE "status" = 'PUBLISHED';--> statement-breakpoint
CREATE INDEX "posts_feed_idx" ON "posts" USING btree ("status","published_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_published_at_matches_status" CHECK (("posts"."status" = 'PUBLISHED' AND "posts"."published_at" IS NOT NULL) OR ("posts"."status" <> 'PUBLISHED' AND "posts"."published_at" IS NULL));
