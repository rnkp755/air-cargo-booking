ALTER TABLE "events" ALTER COLUMN "entity_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."event_entity";--> statement-breakpoint
CREATE TYPE "public"."event_entity" AS ENUM('BOOKING');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "entity_type" SET DATA TYPE "public"."event_entity" USING "entity_type"::"public"."event_entity";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "event_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."event_type";--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('BOOKED', 'DEPARTED', 'ARRIVED', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "event_type" SET DATA TYPE "public"."event_type" USING "event_type"::"public"."event_type";