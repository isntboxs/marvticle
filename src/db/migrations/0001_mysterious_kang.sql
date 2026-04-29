ALTER TABLE "user" ADD COLUMN "banner" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "pronouns" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "education" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "work" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;