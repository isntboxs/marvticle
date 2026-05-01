ALTER TABLE "user" ADD COLUMN "banner" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "pronouns" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "education" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "work" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_published_at_matches_status" CHECK (("posts"."status" = 'PUBLISHED' AND "posts"."published_at" IS NOT NULL) OR ("posts"."status" <> 'PUBLISHED' AND "posts"."published_at" IS NULL));--> statement-breakpoint
CREATE INDEX "posts_feed_idx" ON "posts" USING btree ("status","published_at" DESC NULLS LAST,"id" DESC NULLS LAST);
